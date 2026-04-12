import { Controller, Post, Body, Req, UseGuards, Headers, type RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtGuard)
  createCheckout(@Req() req, @Body() body: { plan: string, annual: boolean }) {
    return this.billingService.createCheckout(req.tenantId, body.plan, body.annual);
  }

  @Post('portal')
  @UseGuards(JwtGuard)
  createPortal(@Req() req) {
    return this.billingService.createPortalSession(req.tenantId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) throw new Error('Body and RawBody must be provided');
    return this.billingService.handleStripeWebhook(req.rawBody.toString(), signature);
  }
}
