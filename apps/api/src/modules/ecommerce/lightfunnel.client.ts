import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class LightFunnelClient {
  async getProducts(storeId: string, apiKey: string): Promise<any[]> {
    const { data } = await axios.get(`https://api.lightfunnel.com/v1/stores/${storeId}/products`, {
      headers: { 'X-API-Key': apiKey },
    });

    return (data.products || []).map((p: any) => ({
      external_id: p.id?.toString(),
      platform: 'lightfunnel',
      name: p.title,
      sku: p.sku || '',
      price: (p.price || 0) / 100,
      stock: p.quantity || 0,
      image_url: p.image_url || null,
    }));
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const computed = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex');
    try {
      return timingSafeEqual(Buffer.from(computed), Buffer.from(signature || ''));
    } catch {
      return false;
    }
  }
}
