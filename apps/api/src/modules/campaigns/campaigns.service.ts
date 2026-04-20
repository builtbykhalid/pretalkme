import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { CampaignWorker } from './campaign.worker';

@Injectable()
export class CampaignsService {
  constructor(private readonly campaignWorker: CampaignWorker) {}

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
    await this.campaignWorker.startCampaign(tenantId, campaignId);
    return { success: true, status: 'running' };
  }

  async pauseCampaign(campaignId: string) {
    await this.campaignWorker.pauseCampaign(campaignId);
    return { success: true, status: 'paused' };
  }

  async resumeCampaign(tenantId: string, campaignId: string) {
    await this.campaignWorker.resumeCampaign(tenantId, campaignId);
    return { success: true, status: 'running' };
  }

  async getCampaignContacts(tenantId: string, campaignId: string) {
    const { data, error } = await supabase
      .from('campaign_contacts')
      .select('*, contacts(id, name, phone)')
      .eq('tenant_id', tenantId)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getCampaignStats(tenantId: string, campaignId: string) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('id, status, sent_count, delivered_count, failed_count, completed_at')
      .eq('tenant_id', tenantId)
      .eq('id', campaignId)
      .single();

    if (error) throw error;
    return campaign;
  }
}
