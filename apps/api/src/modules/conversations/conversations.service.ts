import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class ConversationsService {
  async findAll(tenantId: string, query: any) {
    const { data, count, error } = await supabase
      .from('conversations')
      .select('*, contact:contacts(*)', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return { data, total: count };
  }

  async findOne(tenantId: string, id: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, contact:contacts(*)')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async update(tenantId: string, id: string, body: any) {
    const { data, error } = await supabase
      .from('conversations')
      .update(body)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessages(tenantId: string, conversationId: string, query: any) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async sendManualMessage(tenantId: string, conversationId: string, userId: string, body: any) {
    // 1. Save message to DB
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        tenant_id: tenantId,
        conversation_id: conversationId,
        direction: 'outbound',
        type: body.type || 'text',
        content: body.content,
        meta_id: 'pending', // Will be updated after Meta API call
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: In a real implementation, we would call the Meta API here via WhatsappService
    // and then update the meta_id. For now, we assume the DB trigger handling last_message_at works.

    return message;
  }

  async addNote(tenantId: string, conversationId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        tenant_id: tenantId,
        conversation_id: conversationId,
        direction: 'outbound',
        type: 'note',
        content: content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async takeOver(tenantId: string, id: string, userId: string) {
    return this.update(tenantId, id, { ai_active: false });
  }

  async releaseToAI(tenantId: string, id: string) {
    return this.update(tenantId, id, { ai_active: true });
  }
}
