import { Controller, Get, Post, Query, Body, Headers, HttpCode, Res } from '@nestjs/common';
import type { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('webhook')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // Verification webhook Meta (GET)
  @Get('meta')
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
  @Post('meta')
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
