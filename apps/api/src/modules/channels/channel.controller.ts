import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FacebookAdapter } from '../../channels/facebook.adapter';
import { InstagramAdapter } from '../../channels/instagram.adapter';
import { WhatsAppAdapter } from '../../channels/whatsapp.adapter';
import { MessageRouter } from './message-router.service';

@Controller('webhook')
export class ChannelController {
  constructor(
    private readonly waAdapter: WhatsAppAdapter,
    private readonly fbAdapter: FacebookAdapter,
    private readonly igAdapter: InstagramAdapter,
    private readonly messageRouter: MessageRouter,
  ) {}

  @Post('meta-unified')
  @HttpCode(200)
  async handleMetaWebhook(@Body() body: any, @Res() res: Response) {
    const channel = this.detectChannel(body);
    const adapter =
      channel === 'facebook' ? this.fbAdapter : channel === 'instagram' ? this.igAdapter : this.waAdapter;

    const messages = adapter.normalizeInbound(body);
    for (const msg of messages) {
      await this.messageRouter.route(msg);
    }

    return res.status(200).send('OK');
  }

  private detectChannel(body: any): 'whatsapp' | 'facebook' | 'instagram' {
    const firstEntry = body.entry?.[0];
    if (firstEntry?.changes?.[0]?.value?.messaging_product === 'whatsapp') return 'whatsapp';
    if (body.object === 'instagram') return 'instagram';
    if (firstEntry?.messaging?.[0]?.message) return 'facebook';
    return 'whatsapp';
  }
}
