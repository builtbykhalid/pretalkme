export interface Order {
  id: string;
  tenantId: string;
  contactId: string;
  externalOrderId?: string;
  source: 'youcan' | 'shopify' | 'woocommerce' | 'manual';
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}
