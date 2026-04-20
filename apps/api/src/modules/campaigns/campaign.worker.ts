import { Injectable, OnModuleInit } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { RabbitmqService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ConversationsGateway } from '../conversations/conversations.gateway';

@Injectable()
export class CampaignWorker implements OnModuleInit {
  private readonly RATE_LIMIT_MS = 1000;
  private runningCampaigns = new Set<string>();
  private pausedCampaigns = new Set<string>();

  constructor(
    private readonly rabbitmq: RabbitmqService,
    private readonly whatsappService: WhatsappService,
    private readonly gateway: ConversationsGateway,
  ) {}

  async onModuleInit() {
    await this.rabbitmq.consume('campaign.tasks', async (task) => {
      await this.processCampaign(task.campaignId, task.tenantId);
    });
  }

  async startCampaign(tenantId: string, campaignId: string) {
    await supabase.from('campaigns').update({ status: 'running' }).eq('id', campaignId);
    await this.rabbitmq.publish('campaign.tasks', { campaignId, tenantId });
  }

  async processCampaign(campaignId: string, tenantId: string) {
    this.runningCampaigns.add(campaignId);

    const { data: pending } = await supabase
      .from('campaign_contacts')
      .select('id, contact_id, contacts(phone, wa_id, opt_out)')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*, tenants(wa_phone_id, meta_token)')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      this.runningCampaigns.delete(campaignId);
      return;
    }

    let sentCount = campaign.sent_count || 0;
    let failedCount = campaign.failed_count || 0;

    for (const item of pending || []) {
      const contact = Array.isArray(item.contacts) ? item.contacts[0] : item.contacts;

      if (this.pausedCampaigns.has(campaignId)) {
        await supabase
          .from('campaigns')
          .update({ status: 'paused', paused_at: new Date().toISOString() })
          .eq('id', campaignId);
        this.runningCampaigns.delete(campaignId);
        return;
      }

      if (contact?.opt_out) {
        await supabase.from('campaign_contacts').update({ status: 'skipped' }).eq('id', item.id);
        continue;
      }

      try {
        await this.whatsappService.sendTextMessage(
          campaign.tenants.wa_phone_id,
          campaign.tenants.meta_token,
          contact?.phone,
          campaign.template_id,
        );

        await supabase
          .from('campaign_contacts')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', item.id);

        sentCount += 1;
        await supabase.from('campaigns').update({ sent_count: sentCount }).eq('id', campaignId);

        this.gateway.emitCampaignProgress(tenantId, {
          campaignId,
          sentCount,
          total: (pending || []).length,
          failedCount,
        });

        await new Promise((resolve) => setTimeout(resolve, this.RATE_LIMIT_MS));
      } catch (error: any) {
        failedCount += 1;
        await supabase
          .from('campaign_contacts')
          .update({ status: 'failed', error_message: error?.message || 'Unknown error' })
          .eq('id', item.id);

        await supabase.from('campaigns').update({ failed_count: failedCount }).eq('id', campaignId);

        if (error?.response?.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }
    }

    await supabase
      .from('campaigns')
      .update({ status: 'completed', completed_at: new Date().toISOString(), failed_count: failedCount })
      .eq('id', campaignId);

    this.runningCampaigns.delete(campaignId);
  }

  async pauseCampaign(campaignId: string) {
    this.pausedCampaigns.add(campaignId);
  }

  async resumeCampaign(tenantId: string, campaignId: string) {
    this.pausedCampaigns.delete(campaignId);
    await supabase.from('campaigns').update({ status: 'running' }).eq('id', campaignId);
    await this.rabbitmq.publish('campaign.tasks', { campaignId, tenantId });
  }
}
