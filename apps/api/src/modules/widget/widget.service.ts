import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class WidgetService {
  async getPublicConfig(publicKey: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, widget_enabled, widget_brand_color, widget_greeting')
      .eq('widget_public_key', publicKey)
      .single();

    if (error || !data || !data.widget_enabled) {
      return { enabled: false };
    }

    return {
      enabled: true,
      tenant_id: data.id,
      brand_color: data.widget_brand_color,
      greeting: data.widget_greeting,
      name: data.name,
    };
  }

  async startSession(body: { publicKey: string; visitorId: string; pageUrl?: string; userAgent?: string }) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('widget_public_key', body.publicKey)
      .single();

    if (!tenant) throw new Error('Invalid public key');

    const { data: session, error } = await supabase
      .from('widget_sessions')
      .upsert(
        {
          tenant_id: tenant.id,
          visitor_id: body.visitorId,
          page_url: body.pageUrl || null,
          user_agent: body.userAgent || null,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id,visitor_id' },
      )
      .select()
      .single();

    if (error) throw error;

    if (!session.conversation_id) {
      const { data: contact } = await supabase
        .from('contacts')
        .insert({
          tenant_id: tenant.id,
          wa_id: `widget:${body.visitorId}`,
          phone: `widget:${body.visitorId}`,
          name: 'Website Visitor',
          source: 'widget',
        })
        .select()
        .single();

      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          tenant_id: tenant.id,
          contact_id: contact?.id || null,
          status: 'open',
          channel: 'whatsapp',
        })
        .select()
        .single();

      await supabase
        .from('widget_sessions')
        .update({
          contact_id: contact?.id || null,
          conversation_id: conversation?.id || null,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      return { ...session, contact_id: contact?.id, conversation_id: conversation?.id };
    }

    return session;
  }

  async receiveMessage(body: { sessionId: string; visitorId: string; publicKey: string; text: string }) {
    const { data: session } = await supabase
      .from('widget_sessions')
      .select('id, tenant_id, visitor_id, conversation_id')
      .eq('id', body.sessionId)
      .eq('visitor_id', body.visitorId)
      .single();

    if (!session) throw new Error('Invalid session');

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        tenant_id: session.tenant_id,
        conversation_id: session.conversation_id,
        direction: 'inbound',
        type: 'text',
        content: body.text,
        channel: 'whatsapp',
      })
      .select()
      .single();

    if (error) throw error;

    return message;
  }

  async getSettings(tenantId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, widget_public_key, widget_enabled, widget_brand_color, widget_greeting')
      .eq('id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSettings(tenantId: string, body: { enabled?: boolean; brand_color?: string; greeting?: string }) {
    const updatePayload: Record<string, unknown> = {};
    if (body.enabled !== undefined) updatePayload.widget_enabled = body.enabled;
    if (body.brand_color !== undefined) updatePayload.widget_brand_color = body.brand_color;
    if (body.greeting !== undefined) updatePayload.widget_greeting = body.greeting;

    const { data, error } = await supabase
      .from('tenants')
      .update(updatePayload)
      .eq('id', tenantId)
      .select('id, name, widget_public_key, widget_enabled, widget_brand_color, widget_greeting')
      .single();

    if (error) throw error;
    return data;
  }

  async getMessages(sessionId: string, since?: string) {
    const { data: session } = await supabase
      .from('widget_sessions')
      .select('conversation_id')
      .eq('id', sessionId)
      .single();

    if (!session?.conversation_id) return [];

    let req = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', session.conversation_id)
      .order('created_at', { ascending: true });

    if (since) req = req.gt('created_at', since);

    const { data, error } = await req;
    if (error) throw error;
    return data;
  }
}
