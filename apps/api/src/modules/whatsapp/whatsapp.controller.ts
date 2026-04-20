import { Controller, Get, Post, Param, Query, Body, Headers, HttpCode, Res } from '@nestjs/common';
import type { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller()
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // Agent sends manual message from dashboard
  @Post('conversations/:conversationId/send')
  @HttpCode(200)
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: { tenant_id: string; text: string; type?: 'text' | 'note' }
  ) {
    return this.whatsappService.sendAgentMessage(body.tenant_id, conversationId, body.text, body.type || 'text');
  }

  // Verification webhook Meta (GET)
  @Get('webhook/meta')
  verifyWebhook(@Query() query: any, @Res() res: Response) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // Reception messages Meta (POST)
  @Post('webhook/meta')
  @HttpCode(200)
  async receiveWebhook(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
    @Res() res: Response
  ) {
    // 1. Verify signature HMAC
    const isValid = this.whatsappService.verifySignature(
      JSON.stringify(body),
      signature,
      process.env.META_APP_SECRET || ''
    );
    
    if (!isValid) {
      console.warn('WhatsappController: Invalid signature');
      // Still respond 200/202 to avoid Meta retrying if it's not a real attack
      return res.status(200).send('OK'); 
    }

    // 2. Process asynchronous logic
    // We don't await this to respond to Meta immediately
    this.whatsappService.processWebhookAsync(body).catch(err => {
      console.error('WhatsappController: Async process error', err);
    });

    return res.status(200).send('OK');
  }
}
