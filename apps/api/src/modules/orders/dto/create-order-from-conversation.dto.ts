import { OrderItemDto } from './create-order.dto';

export class CreateOrderFromConversationDto {
  conversation_id?: string;
  conversationId?: string;
  contact_id?: string;
  contactId?: string;
  platform?: string;
  source?: 'chat' | 'ecommerce' | 'api' | 'webhook';
  status?: string;
  items: Array<OrderItemDto & { productId?: string; productName?: string; name?: string; unitPrice?: number; price?: number }>;
  notes?: string;
  total?: number;
  address?: Record<string, unknown>;
  address_json?: Record<string, unknown>;
}
