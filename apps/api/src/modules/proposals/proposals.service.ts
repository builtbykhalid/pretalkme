import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { RabbitmqService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import PDFDocument from 'pdfkit';

export interface CreateProposalDto {
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  conversation_id?: string;  // source WA conversation
  contact_id?: string;       // WA contact id
  engagement_id?: string;    // existing shared.engagement (optional)
}

export interface UpdateProposalStatusDto {
  status: 'draft' | 'sent' | 'signed' | 'paid' | 'cancelled';
  signed_at?: string;
  paid_at?: string;
  sent_at?: string;
}

@Injectable()
export class ProposalsService {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  private readonly documentsBucket = process.env.SUPABASE_DOCUMENTS_BUCKET || 'documents';

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Verify the document belongs to the tenant. Throws if not. */
  private async assertOwnership(tenantId: string, docId: string) {
    const { data, error } = await (supabase as any)
      .schema('shared')
      .from('documents')
      .select('id')
      .eq('id', docId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) throw new NotFoundException('Document not found');
  }

  /** Resolve or create a shared.engagement for a WA conversation. */
  private async resolveEngagement(tenantId: string, dto: CreateProposalDto): Promise<string | null> {
    if (dto.engagement_id) return dto.engagement_id;
    if (!dto.conversation_id) return null;

    // Look for existing
    const { data: existing } = await (supabase as any)
      .schema('shared')
      .from('engagements')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('source_id', dto.conversation_id)
      .limit(1);

    if (existing?.[0]) {
      // Advance to proposed
      await (supabase as any)
        .schema('shared')
        .from('engagements')
        .update({
          status: 'proposed',
          proposed_at: new Date().toISOString(),
          ...(dto.amount ? { amount: dto.amount, currency: dto.currency || 'MAD' } : {}),
        })
        .eq('id', existing[0].id);
      return existing[0].id;
    }

    // Resolve shared contact
    let sharedContactId: string | null = null;
    if (dto.contact_id) {
      const { data: sc } = await (supabase as any)
        .schema('shared')
        .from('contacts')
        .select('id')
        .eq('wa_contact_id', dto.contact_id)
        .limit(1);
      sharedContactId = sc?.[0]?.id ?? null;
    }

    const { data: newEng, error } = await (supabase as any)
      .schema('shared')
      .from('engagements')
      .insert({
        tenant_id: tenantId,
        contact_id: sharedContactId,
        source_app: 'whatsapp',
        source_id: dto.conversation_id,
        status: 'proposed',
        title: dto.title,
        description: dto.description ?? null,
        amount: dto.amount ?? null,
        currency: dto.currency ?? 'MAD',
        proposed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return newEng.id;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async create(tenantId: string, userId: string, dto: CreateProposalDto) {
    const engagementId = await this.resolveEngagement(tenantId, dto);

    // Resolve shared contact id
    let sharedContactId: string | null = null;
    if (dto.contact_id) {
      const { data: sc } = await (supabase as any)
        .schema('shared')
        .from('contacts')
        .select('id')
        .eq('wa_contact_id', dto.contact_id)
        .limit(1);
      sharedContactId = sc?.[0]?.id ?? null;
    }

    const ref = `DEVIS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

    const { data, error } = await (supabase as any)
      .schema('shared')
      .from('documents')
      .insert({
        tenant_id: tenantId,
        engagement_id: engagementId,
        contact_id: sharedContactId,
        type: 'proposal',
        status: 'draft',
        title: dto.title,
        reference: ref,
        amount: dto.amount ?? null,
        currency: dto.currency ?? 'MAD',
        created_by_app: 'whatsapp',
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Post internal note in the conversation if source is WA
    if (dto.conversation_id) {
      await supabase.from('messages').insert({
        tenant_id: tenantId,
        conversation_id: dto.conversation_id,
        direction: 'outbound',
        type: 'note',
        content: `📄 Devis créé : ${dto.title}${dto.amount ? ` — ${dto.amount} ${dto.currency || 'MAD'}` : ''} (${ref})`,
      });
    }

    return data;
  }

  async findAll(tenantId: string, sourceApp?: string) {
    let query = (supabase as any)
      .schema('shared')
      .from('documents')
      .select(`
        id, type, status, title, reference, amount, currency,
        created_by_app, created_at, updated_at, sent_at, signed_at, paid_at,
        engagement:engagements ( id, status, source_id ),
        contact:contacts ( id, full_name, phone )
      `)
      .eq('tenant_id', tenantId)
      .eq('type', 'proposal')
      .order('created_at', { ascending: false });

    if (sourceApp) {
      query = query.eq('created_by_app', sourceApp);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(tenantId: string, id: string) {
    const { data, error } = await (supabase as any)
      .schema('shared')
      .from('documents')
      .select(`
        *,
        engagement:engagements ( * ),
        contact:contacts ( * )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) throw new NotFoundException('Document not found');
    return data;
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateProposalStatusDto) {
    await this.assertOwnership(tenantId, id);

    const updates: Record<string, any> = { status: dto.status };
    if (dto.sent_at)   updates.sent_at   = dto.sent_at;
    if (dto.signed_at) updates.signed_at = dto.signed_at;
    if (dto.paid_at)   updates.paid_at   = dto.paid_at;

    // Mirror status in linked engagement
    const engStatusMap: Record<string, string> = {
      sent:      'proposed',
      signed:    'signed',
      paid:      'invoiced',
      cancelled: 'lost',
    };

    if (engStatusMap[dto.status]) {
      const { data: doc } = await (supabase as any)
        .schema('shared')
        .from('documents')
        .select('engagement_id')
        .eq('id', id)
        .single();

      if (doc?.engagement_id) {
        await (supabase as any)
          .schema('shared')
          .from('engagements')
          .update({
            status: engStatusMap[dto.status],
            ...(dto.status === 'signed'    ? { signed_at:   dto.signed_at   || new Date().toISOString() } : {}),
            ...(dto.status === 'paid'      ? { invoiced_at: dto.paid_at     || new Date().toISOString() } : {}),
          })
          .eq('id', doc.engagement_id);
      }
    }

    const { data, error } = await (supabase as any)
      .schema('shared')
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(tenantId: string, id: string) {
    await this.assertOwnership(tenantId, id);
    const { error } = await (supabase as any)
      .schema('shared')
      .from('documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  private buildProposalPdfBuffer(input: {
    title: string;
    reference?: string | null;
    contactName?: string | null;
    contactPhone?: string | null;
    amount?: number | null;
    currency?: string | null;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(24).text('Devis', { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#555').text(`Reference: ${input.reference || 'N/A'}`);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`);
      doc.moveDown(1);

      doc.fillColor('#111').fontSize(13).text('Client');
      doc.fontSize(11).fillColor('#333').text(`Nom: ${input.contactName || 'N/A'}`);
      doc.text(`Telephone: ${input.contactPhone || 'N/A'}`);
      doc.moveDown(1);

      doc.fillColor('#111').fontSize(13).text('Objet du devis');
      doc.fontSize(11).fillColor('#333').text(input.title || 'Prestation de service');
      doc.moveDown(1);

      if (typeof input.amount === 'number') {
        doc.fillColor('#111').fontSize(13).text('Montant');
        doc
          .fontSize(16)
          .fillColor('#00A884')
          .text(`${input.amount.toLocaleString('fr-MA')} ${input.currency || 'MAD'}`);
        doc.moveDown(1);
      }

      doc
        .fontSize(10)
        .fillColor('#666')
        .text('Document genere automatiquement par Pretalk.', { align: 'left' });

      doc.end();
    });
  }

  async generatePdf(tenantId: string, id: string) {
    const { data: docRow, error } = await (supabase as any)
      .schema('shared')
      .from('documents')
      .select(`
        id, title, reference, amount, currency,
        contact:contacts ( full_name, phone )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !docRow) throw new NotFoundException('Document not found');

    const pdfBuffer = await this.buildProposalPdfBuffer({
      title: docRow.title,
      reference: docRow.reference,
      contactName: docRow.contact?.full_name,
      contactPhone: docRow.contact?.phone,
      amount: docRow.amount,
      currency: docRow.currency,
    });

    const storagePath = `proposals/${tenantId}/${id}.pdf`;
    const uploadRes = await (supabase as any).storage
      .from(this.documentsBucket)
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadRes?.error) {
      throw uploadRes.error;
    }

    const publicUrlRes = (supabase as any).storage.from(this.documentsBucket).getPublicUrl(storagePath);
    const publicUrl = publicUrlRes?.data?.publicUrl || null;

    await (supabase as any)
      .schema('shared')
      .from('documents')
      .update({ storage_path: storagePath, public_url: publicUrl })
      .eq('id', id)
      .eq('tenant_id', tenantId);

    return {
      success: true,
      storage_path: storagePath,
      public_url: publicUrl,
    };
  }

  async sendViaWhatsApp(tenantId: string, id: string) {
    const { data: doc, error } = await (supabase as any)
      .schema('shared')
      .from('documents')
      .select(`
        id, title, reference, public_url, storage_path,
        contact:contacts ( id, phone ),
        engagement:engagements ( id, source_id )
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !doc) throw new NotFoundException('Document not found');

    const phone = doc.contact?.phone;
    const conversationId = doc.engagement?.source_id;

    if (!phone || !conversationId) {
      throw new NotFoundException('Missing target phone or source conversation');
    }

    if (!doc.public_url && !doc.storage_path) {
      await this.generatePdf(tenantId, id);
      const { data: refreshed } = await (supabase as any)
        .schema('shared')
        .from('documents')
        .select('public_url, storage_path')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (refreshed) {
        doc.public_url = refreshed.public_url;
        doc.storage_path = refreshed.storage_path;
      }
    }

    const documentUrl = doc.public_url || doc.storage_path || '';
    const message = documentUrl
      ? `📄 Votre devis est disponible : ${documentUrl}`
      : `📄 Votre devis \"${doc.title || doc.reference || 'Devis'}\" est pret.`;

    await this.rabbitmqService.publish('whatsapp.outbound', {
      tenant_id: tenantId,
      conversation_id: conversationId,
      to: phone,
      text_response: message,
      audio_url: null,
    });

    const now = new Date().toISOString();

    await (supabase as any)
      .schema('shared')
      .from('documents')
      .update({ status: 'sent', sent_at: now })
      .eq('id', id);

    if (doc.engagement?.id) {
      await (supabase as any)
        .schema('shared')
        .from('engagements')
        .update({ status: 'proposed', proposed_at: now })
        .eq('id', doc.engagement.id);
    }

    return { success: true, status: 'sent', conversation_id: conversationId };
  }
}
