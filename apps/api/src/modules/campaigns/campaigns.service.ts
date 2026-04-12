import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class CampaignsService {
  constructor(private readonly whatsappService: WhatsappService) {}

  async findAll(tenantId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async create(tenantId: string, campaignData: any) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ ...campaignData, tenant_id: tenantId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async startCampaign(tenantId: string, campaignId: string) {
    // 1. Get campaign and contacts
    const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();
    const { data: contacts } = await supabase.from('contacts').select('*').eq('tenant_id', tenantId);

    // 2. Mark campaign as running
    await supabase.from('campaigns').update({ status: 'running' }).eq('id', campaignId);

    // 3. Batch send (simplified for demo)
    for (const contact of (contacts || [])) {
      // In real scenario, this would be queued in RabbitMQ to handle Meta rate limits
      // For now, call WhatsappService
      await this.whatsappService.sendManualMessage({
        tenant_id: tenantId,
        conversation_id: 'campaign_temp', // Needs actual conv
        text_response: `Bonjour ${contact.name}, voici notre offre spéciale !`,
      });
      
      await supabase.from('campaign_contacts').upsert({
        campaign_id: campaignId,
        contact_id: contact.id,
        tenant_id: tenantId,
        status: 'sent',
        sent_at: new Date().toISOString()
      });
    }

    await supabase.from('campaigns').update({ status: 'completed' }).eq('id', campaignId);
    return { success: true };
  }
}
