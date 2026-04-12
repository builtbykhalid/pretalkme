import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface ExternalProduct {
  external_id: string;
  platform: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image_url: string | null;
}

export interface ExternalOrder {
  external_id: string;
  platform: string;
  status: string;
  total: number;
  items_json: any;
  address_json: any;
}

@Injectable()
export class YoucanClient {
  async getProducts(storeUrl: string, apiKey: string): Promise<ExternalProduct[]> {
    try {
      // Note: YouCan API URL may vary depending on official docs but follow the plan pattern
      const { data } = await axios.get(`${storeUrl}/api/v2/products`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      
      return data.data.map((p: any) => ({
        external_id: p.id.toString(),
        platform: 'youcan',
        name: p.name,
        sku: p.sku || '',
        price: parseFloat(p.price),
        stock: p.stock_quantity || 0,
        image_url: p.images?.[0]?.url || null,
      }));
    } catch (error) {
      console.error('YoucanClient: getProducts error', error.message);
      return [];
    }
  }

  async getOrders(storeUrl: string, apiKey: string): Promise<ExternalOrder[]> {
    try {
      const { data } = await axios.get(`${storeUrl}/api/v2/orders`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      
      return data.data.map((o: any) => ({
        external_id: o.id.toString(),
        platform: 'youcan',
        status: this.mapStatus(o.status),
        total: parseFloat(o.total),
        items_json: o.items,
        address_json: o.shipping_address,
      }));
    } catch (error) {
      console.error('YoucanClient: getOrders error', error.message);
      return [];
    }
  }

  private mapStatus(status: string): string {
    const map: Record<string, string> = { 
      '0': 'new', 
      '1': 'confirmed', 
      '2': 'shipped', 
      '3': 'delivered', 
      '4': 'cancelled' 
    };
    return map[status] || 'new';
  }
}
