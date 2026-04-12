import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class DashboardService {
  async getStats(tenantId: string) {
    // 1. Get total contacts
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // 2. Get total campaigns
    const { count: totalCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // 3. Get total messages
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    return {
      totalContacts: totalContacts || 0,
      totalCampaigns: totalCampaigns || 0,
      totalMessages: totalMessages || 0,
    };
  }

  async getWhatsappAccount(tenantId: string) {
    // This info should be in 'tenants' table or fetched from Meta
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, whatsapp_phone, whatsapp_status')
      .eq('id', tenantId)
      .single();

    return {
      displayName: tenant?.name || 'Boutique WhatsApp',
      phoneNumber: tenant?.whatsapp_phone || '+212 000-000000',
      tier: 'TIER_10K', // Mocked for now
      qualityRating: 'HIGH',
      numberStatus: tenant?.whatsapp_status || 'CONNECTED',
      accountStatus: 'APPROVED',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/${tenant?.whatsapp_phone?.replace(/\D/g, '')}`,
    };
  }
}
