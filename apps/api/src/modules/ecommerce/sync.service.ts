import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { YoucanClient } from './youcan.client';

@Injectable()
export class SyncService {
  constructor(private readonly youcanClient: YoucanClient) {}

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
}
