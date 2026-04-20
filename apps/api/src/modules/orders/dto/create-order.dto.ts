export class OrderItemDto {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export class CreateOrderDto {
  conversation_id?: string;
  contact_id: string;
  platform?: string;
  source: 'chat' | 'ecommerce' | 'api' | 'webhook';
  status?: string;
  items: OrderItemDto[];
  notes?: string;
  total?: number;
  address?: Record<string, unknown>;
}
