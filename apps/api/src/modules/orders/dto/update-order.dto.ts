export class UpdateOrderDto {
  status?: string;
  notes?: string;
  total?: number;
  items_json?: unknown[];
  address_json?: Record<string, unknown>;
  confirmed_at?: string;
  sent_at?: string;
}
