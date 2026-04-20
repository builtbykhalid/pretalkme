import { Injectable, OnModuleInit } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { RabbitmqService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { ConversationsService } from '../conversations/conversations.service';
import { ConversationsGateway } from '../conversations/conversations.gateway';
import axios from 'axios';

@Injectable()
export class WhatsappService implements OnModuleInit {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly conversationsService: ConversationsService,
    private readonly gateway: ConversationsGateway,
  ) {}

  async onModuleInit() {
    // Listen for outbound messages to send to Meta (MODULE 4)
    await this.rabbitmqService.consume('whatsapp.outbound', async (data) => {
      await this.sendManualMessage(data);
    });
  }

  async sendAgentMessage(tenantId: string, conversationId: string, text: string, type: 'text' | 'note') {
    // Save message to DB
    const { data: message } = await supabase.from('messages').insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      direction: 'outbound',
      type,
      content: text,
    }).select().single();

    // Mark conversation as human-controlled
    await supabase.from('conversations')
      .update({ ai_active: false, status: 'open' })
      .eq('id', conversationId);

    // Notes are internal — don't send via Meta
    if (type === 'note') return { success: true, message };

    // Send via Meta
    const { data: tenant } = await supabase.from('tenants')
      .select('wa_phone_id, meta_token')
      .eq('id', tenantId)
      .single();

    if (!tenant?.meta_token) return { success: true, message, sent: false };

    const conversation = await this.conversationsService.findOne(tenantId, conversationId);
    const toPhone = conversation.contact.phone;

    await this.sendTextMessage(tenant.wa_phone_id, tenant.meta_token, toPhone, text);

    // Notify WebSocket clients
    this.gateway.emitNewMessage(tenantId, message);

    return { success: true, message, sent: true };
  }

  async sendManualMessage(data: any) {
    const { tenant_id, conversation_id, text_response, audio_url } = data;

    // 1. Get tenant meta token
    const { data: tenant } = await supabase
      .from('tenants')
      .select('wa_phone_id, meta_token')
      .eq('id', tenant_id)
      .single();

    if (!tenant?.meta_token) return;

    // 2. Get contact phone
    const conversation = await this.conversationsService.findOne(tenant_id, conversation_id);
    const toPhone = conversation.contact.phone;

    // 3. Send via Meta API
    if (text_response) {
      await this.sendTextMessage(tenant.wa_phone_id, tenant.meta_token, toPhone, text_response);
    }
    
    // Save outbound message to DB
    await supabase.from('messages').insert({
      tenant_id,
      conversation_id,
      direction: 'outbound',
      type: 'text',
      content: text_response,
      meta_id: 'sent_via_api',
    });
  }

  // Meta API Helpers
  async sendTextMessage(phoneId: string, token: string, to: string, text: string) {
    try {
      await axios.post(
        `https://graph.facebook.com/v25.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.error('Meta API Error:', e.response?.data || e.message);
    }
  }

  verifySignature(body: string, signature: string, secret: string): boolean {
    if (!signature) return false;
    const expected = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch (e) {
      return false;
    }
  }

  async processWebhookAsync(body: any) {
    const entries = body.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        const messages = change.value?.messages || [];
        for (const msg of messages) {
          await this.handleInboundMessage(change.value, msg);
        }
      }
    }
  }

  private async handleInboundMessage(value: any, metaMsg: any) {
    const phoneNumberId = value.metadata.phone_number_id;

    // 1. Identify tenant by phone_number_id
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, ai_enabled, meta_token')
      .eq('wa_phone_id', phoneNumberId)
      .single();

    if (!tenant) {
      console.warn(`WhatsappService: No tenant found for phone_id ${phoneNumberId}`);
      return;
    }

    // 2. Upsert contact
    const contact = await this.upsertContact(tenant.id, metaMsg);

    // 3. Find or create conversation
    const conversation = await this.upsertConversation(tenant.id, contact.id);

    // 4. Save the message
    const message = await this.saveMessage(tenant.id, conversation.id, metaMsg);

    let audioUrl: string | null = null;
    let imageUrl: string | null = null;
    let imageMimeType: string | null = null;
    let pdfUrl: string | null = null;
    let pdfFilename: string | null = null;

    if (metaMsg.type === 'audio' && metaMsg.audio?.id) {
      audioUrl = await this.downloadAndUploadMedia(tenant.meta_token, metaMsg.audio.id, 'audio');
    }

    if (metaMsg.type === 'image' && metaMsg.image?.id) {
      imageUrl = await this.downloadAndUploadMedia(tenant.meta_token, metaMsg.image.id, 'image');
      imageMimeType = metaMsg.image.mime_type || 'image/jpeg';
    }

    if (metaMsg.type === 'document' && metaMsg.document?.id) {
      const filename = metaMsg.document.filename || 'document.pdf';
      if (filename.toLowerCase().endsWith('.pdf')) {
        pdfUrl = await this.downloadAndUploadMedia(tenant.meta_token, metaMsg.document.id, 'document');
        pdfFilename = filename;
      }
    }

    // 5. Handle AI processing if enabled
    if (tenant.ai_enabled && conversation.ai_active) {
      await this.rabbitmqService.publish('ai.tasks', {
        tenant_id: tenant.id,
        conversation_id: conversation.id,
        message_id: message.id,
        text_message: metaMsg.text?.body || null,
        audio_url: audioUrl,
        image_url: imageUrl,
        image_mime_type: imageMimeType,
        pdf_url: pdfUrl,
        pdf_filename: pdfFilename,
      });
    }

    // 6. Notify Gateway
    this.gateway.emitNewMessage(tenant.id, message);
  }

  private async downloadAndUploadMedia(token: string, mediaId: string, type: 'audio' | 'image' | 'document') {
    try {
      const mediaInfo = await axios.get(`https://graph.facebook.com/v25.0/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return mediaInfo.data?.url || null;
    } catch (error) {
      console.error(`WhatsappService: Failed to resolve ${type} media ${mediaId}`, error?.response?.data || error?.message || error);
      return null;
    }
  }

  private async upsertContact(tenantId: string, metaMsg: any) {
    const phone = metaMsg.from;
    const fullName = metaMsg.contacts?.[0]?.profile?.name || phone;

    // Select-then-insert to avoid needing a UNIQUE constraint
    const { data: existing } = await supabase
      .from('contacts')
      .select()
      .eq('tenant_id', tenantId)
      .eq('wa_id', phone)
      .maybeSingle();

    if (existing) {
      await supabase.from('contacts').update({ name: fullName }).eq('id', existing.id);
      return existing;
    }

    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({ tenant_id: tenantId, phone, name: fullName, wa_id: phone })
      .select()
      .single();

    if (error) throw error;

    supabase.rpc('sync_wa_contact', {
      p_tenant_id: tenantId,
      p_wa_contact_id: contact.id,
      p_phone: phone,
      p_full_name: fullName,
    }).then(({ error: syncError }) => {
      if (syncError) console.warn('WhatsappService: shared.sync_wa_contact failed', syncError.message);
    });

    return contact;
  }

  private async upsertConversation(tenantId: string, contactId: string) {
    const { data: existing } = await supabase
      .from('conversations')
      .select()
      .eq('tenant_id', tenantId)
      .eq('contact_id', contactId)
      .maybeSingle();

    if (existing) return existing;

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ tenant_id: tenantId, contact_id: contactId, status: 'open' })
      .select()
      .single();

    if (error) throw error;
    return conv;
  }

  private async saveMessage(tenantId: string, conversationId: string, metaMsg: any) {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        tenant_id: tenantId,
        conversation_id: conversationId,
        direction: 'inbound',
        type: metaMsg.type === 'text' ? 'text' : 'image',
        content: metaMsg.text?.body || '',
      })
      .select()
      .single();

    if (error) throw error;
    return message;
  }
}
