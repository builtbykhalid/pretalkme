import { Body, Controller, Headers, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { LightFunnelClient } from './lightfunnel.client';
import { SyncService } from './sync.service';

@Controller('webhook')
export class LightfunnelWebhookController {
  constructor(
    private readonly lightFunnelClient: LightFunnelClient,
    private readonly syncService: SyncService,
  ) {}

  @Post('lightfunnel')
  @HttpCode(200)
  async lightFunnelWebhook(
    @Body() body: any,
    @Headers('x-lightfunnel-signature') signature: string,
    @Res() res: Response,
  ) {
    const { data: integration } = await supabase
      .from('integrations')
      .select('tenant_id, webhook_secret')
      .eq('platform', 'lightfunnel')
      .eq('store_url', body.store_id?.toString())
      .single();

    if (!integration) return res.status(404).send('Unknown store');

    const isValid = this.lightFunnelClient.verifyWebhookSignature(
      JSON.stringify(body),
      signature,
      integration.webhook_secret,
    );

    if (!isValid) return res.status(403).send('Invalid signature');

    if (body.event === 'order.created') {
      await this.syncService.handleNewOrder(integration.tenant_id, {
        platform: 'lightfunnel',
        external_id: body.order?.id?.toString(),
        contact_phone: body.order?.customer?.phone,
        contact_name: body.order?.customer?.name,
        total: (body.order?.total || 0) / 100,
        items: body.order?.items || [],
        status: 'new',
      });
    }

    return res.status(200).send('OK');
  }
}
