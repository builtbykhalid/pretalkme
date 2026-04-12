import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
  });

  async createCheckout(tenantId: string, plan: string, annual: boolean) {
    const prices: Record<string, any> = {
      solo:    { monthly: 'price_xxx_solo_m',   annual: 'price_xxx_solo_a' },
      pro:     { monthly: 'price_xxx_pro_m',    annual: 'price_xxx_pro_a' },
      agence:  { monthly: 'price_xxx_agence_m', annual: 'price_xxx_agence_a' },
    };
    
    const priceId = prices[plan]?.[annual ? 'annual' : 'monthly'];
    if (!priceId) throw new Error('Invalid plan selected');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { tenantId },
      success_url: `${process.env.CORS_ORIGIN}/whatsapp/settings/billing?success=1`,
      cancel_url: `${process.env.CORS_ORIGIN}/whatsapp/settings/billing`,
    });

    return { url: session.url };
  }

  async createPortalSession(tenantId: string) {
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('tenant_id', tenantId)
      .single();

    if (error || !sub?.stripe_customer_id) {
      throw new Error('Stripe customer not found');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.CORS_ORIGIN}/whatsapp/settings/billing`,
    });

    return { url: session.url };
  }

  async handleStripeWebhook(body: string, signature: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.syncSubscription(event.data.object as any);
          break;
        case 'customer.subscription.deleted':
          await this.cancelSubscription(event.data.object as any);
          break;
      }
      
      return { received: true };
    } catch (err) {
      console.error(`Stripe Webhook Error: ${err.message}`);
      throw err;
    }
  }

  private async syncSubscription(subscription: any) {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    await supabase.from('subscriptions').upsert({
      tenant_id: tenantId,
      stripe_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      plan_id: subscription.items.data[0].price.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }, { onConflict: 'tenant_id' });

    await supabase.from('tenants').update({
       plan: this.mapPriceToPlan(subscription.items.data[0].price.id)
    }).eq('id', tenantId);
  }

  private async cancelSubscription(subscription: any) {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    await supabase.from('subscriptions').update({
      status: 'canceled',
    }).eq('tenant_id', tenantId);

    await supabase.from('tenants').update({ plan: 'free' }).eq('id', tenantId);
  }

  private mapPriceToPlan(priceId: string): string {
     return 'trial';
  }
}
