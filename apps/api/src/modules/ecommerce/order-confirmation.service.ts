import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class OrderConfirmationService {
  constructor(private readonly whatsappService: WhatsappService) {}

  async sendConfirmation(tenantId: string, orderId: string, triggerStatus = 'new') {
    const { data: order } = await supabase
      .from('orders')
      .select('*, contacts(id, name, phone, wa_id), tenants(name, wa_phone_id, meta_token, wa_number)')
      .eq('id', orderId)
      .single();

    if (!order?.contacts?.phone) return;

    const { data: template } = await supabase
      .from('order_confirmation_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .eq('trigger_status', triggerStatus)
      .or(`platform.eq.${order.platform},platform.is.null`)
      .order('platform', { ascending: true })
      .limit(1)
      .single();

    if (!template) return;

    const itemsText = (order.items_json || [])
      .map((item: any) => `${item.quantity}x ${item.product_name}`)
      .join(', ');

    const message = (template.message_template || '')
      .replace(/\{\{order_id\}\}/g, order.external_id)
      .replace(/\{\{customer_name\}\}/g, order.contacts.name || 'Client')
      .replace(/\{\{total\}\}/g, `${order.total} MAD`)
      .replace(/\{\{items\}\}/g, itemsText)
      .replace(/\{\{status\}\}/g, this.translateStatus(triggerStatus))
      .replace(/\{\{tracking_url\}\}/g, order.tracking_url || 'Non disponible')
      .replace(/\{\{store_name\}\}/g, order.tenants?.name || 'Notre boutique');

    try {
      await this.whatsappService.sendTextMessage(
        order.tenants.wa_phone_id,
        order.tenants.meta_token,
        order.contacts.phone,
        message,
      );

      await supabase.from('order_confirmations').insert({
        tenant_id: tenantId,
        order_id: orderId,
        contact_id: order.contacts.id,
        template_id: template.id,
        message_sent: message,
        status: 'sent',
      });
    } catch (error: any) {
      await supabase.from('order_confirmations').insert({
        tenant_id: tenantId,
        order_id: orderId,
        contact_id: order.contacts.id,
        template_id: template.id,
        message_sent: message,
        status: 'failed',
        error_message: error?.message || 'Unknown error',
      });
    }
  }

  async listTemplates(tenantId: string) {
    const { data, error } = await supabase
      .from('order_confirmation_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createTemplate(tenantId: string, body: any) {
    const { data, error } = await supabase
      .from('order_confirmation_templates')
      .insert({ ...body, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateTemplate(tenantId: string, id: string, body: any) {
    const { data, error } = await supabase
      .from('order_confirmation_templates')
      .update(body)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteTemplate(tenantId: string, id: string) {
    const { error } = await supabase
      .from('order_confirmation_templates')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async history(tenantId: string) {
    const { data, error } = await supabase
      .from('order_confirmations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('sent_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  }

  private translateStatus(status: string): string {
    const map = {
      new: 'Recue',
      confirmed: 'Confirmee',
      shipped: 'Expediee',
      delivered: 'Livree',
    };

    return map[status] || status;
  }
}
