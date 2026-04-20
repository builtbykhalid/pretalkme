import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { YoucanClient } from './youcan.client';
import { OrderConfirmationService } from './order-confirmation.service';

@Injectable()
export class SyncService {
  constructor(
    private readonly youcanClient: YoucanClient,
    private readonly orderConfirmationService: OrderConfirmationService,
  ) {}

  async syncTenant(tenantId: string) {
    // 1. Fetch active integration for the tenant
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .single();

    if (error || !integration) {
      console.warn(`SyncService: No active integration found for tenant ${tenantId}`);
      return { products: 0, orders: 0 };
    }

    let products: any[] = [];
    let orders: any[] = [];

    // 2. Fetch data from the specific platform
    if (integration.platform === 'youcan') {
      products = await this.youcanClient.getProducts(integration.store_url, integration.access_token);
      orders = await this.youcanClient.getOrders(integration.store_url, integration.access_token);
    }
    // Future platforms (Shopify, WooCommerce) go here...

    // 3. Upsert Products into Supabase
    if (products.length > 0) {
      const productUpserts = products.map(p => ({
        ...p,
        tenant_id: tenantId,
        synced_at: new Date().toISOString()
      }));

      const { error: pError } = await supabase
        .from('products')
        .upsert(productUpserts, { onConflict: 'tenant_id,platform,external_id' });
      
      if (pError) console.error('SyncService: Product upsert error', pError);
    }

    // 4. Upsert Orders into Supabase
    if (orders.length > 0) {
      const orderUpserts = orders.map(o => ({
        ...o,
        tenant_id: tenantId
      }));

      const { error: oError } = await supabase
        .from('orders')
        .upsert(orderUpserts, { onConflict: 'tenant_id,platform,external_id' });

      if (oError) console.error('SyncService: Order upsert error', oError);
    }

    return { products: products.length, orders: orders.length };
  }

  async handleNewOrder(tenantId: string, payload: any) {
    const { data: contact } = await supabase
      .from('contacts')
      .upsert(
        {
          tenant_id: tenantId,
          wa_id: payload.contact_phone,
          phone: payload.contact_phone,
          name: payload.contact_name || payload.contact_phone,
        },
        { onConflict: 'tenant_id,wa_id' },
      )
      .select()
      .single();

    const { data: order, error } = await supabase
      .from('orders')
      .upsert(
        {
          tenant_id: tenantId,
          platform: payload.platform,
          external_id: payload.external_id,
          contact_id: contact?.id || null,
          total: payload.total || 0,
          items_json: payload.items || [],
          status: payload.status || 'new',
          source: 'webhook',
        },
        { onConflict: 'tenant_id,platform,external_id' },
      )
      .select()
      .single();

    if (error) throw error;

    await this.orderConfirmationService.sendConfirmation(tenantId, order.id, order.status || 'new');
    return order;
  }
}
