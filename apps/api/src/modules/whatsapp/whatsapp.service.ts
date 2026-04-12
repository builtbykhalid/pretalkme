import { Injectable, OnModuleInit } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { RabbitmqService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { ConversationsService } from '../conversations/conversations.service';
import axios from 'axios';

@Injectable()
export class WhatsappService implements OnModuleInit {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly conversationsService: ConversationsService,
  ) {}

  async onModuleInit() {
    // Listen for outbound messages to send to Meta (MODULE 4)
    await this.rabbitmqService.consume('whatsapp.outbound', async (data) => {
      await this.sendManualMessage(data);
    });
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
      .select('id, ai_enabled')
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

    // 5. Handle AI processing if enabled
    if (tenant.ai_enabled && conversation.ai_active) {
      await this.rabbitmqService.publish('ai.tasks', {
        tenantId: tenant.id,
        conversationId: conversation.id,
        messageId: message.id,
        textMessage: metaMsg.text?.body || null,
        audioUrl: null, // To be implemented with media download logic
      });
    }

    // 6. Notify Gateway (to be implemented)
  }

  private async upsertContact(tenantId: string, metaMsg: any) {
    const phone = metaMsg.from;
    const { data: contact, error } = await supabase
      .from('contacts')
      .upsert({
        tenant_id: tenantId,
        phone,
        name: metaMsg.contacts?.[0]?.profile?.name || phone,
        wa_id: phone,
      }, { onConflict: 'tenant_id,phone' })
      .select()
      .single();
    
    if (error) throw error;
    return contact;
  }

  private async upsertConversation(tenantId: string, contactId: string) {
    const { data: conv, error } = await supabase
      .from('conversations')
      .upsert({
        tenant_id: tenantId,
        contact_id: contactId,
        status: 'open',
      }, { onConflict: 'tenant_id,contact_id' })
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
        type: metaMsg.type === 'text' ? 'text' : 'image', // simplified
        content: metaMsg.text?.body || '',
        meta_id: metaMsg.id,
      })
      .select()
      .single();

    if (error) throw error;
    return message;
  }
}
