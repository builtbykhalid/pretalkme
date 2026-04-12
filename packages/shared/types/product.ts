export interface Product {
  id: string;
  tenantId: string;
  externalProductId?: string;
  name: string;
  sku?: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl?: string;
}
