import { BadRequestException, Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { ConversationsGateway } from '../conversations/conversations.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderFromConversationDto } from './dto/create-order-from-conversation.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { OrderConfirmationService } from '../ecommerce/order-confirmation.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly gateway: ConversationsGateway,
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly orderConfirmationService: OrderConfirmationService,
  ) {}

  async findAll(tenantId: string, query: any) {
    let req = supabase.from('orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });

    if (query?.status) req = req.eq('status', query.status);
    if (query?.source) req = req.eq('source', query.source);
    if (query?.contact_id) req = req.eq('contact_id', query.contact_id);

    const { data, error } = await req;
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findByConversation(tenantId: string, convId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findOne(tenantId: string, id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async create(tenantId: string, userId: string, dto: CreateOrderDto) {
    const total =
      dto.total ?? dto.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        tenant_id: tenantId,
        contact_id: dto.contact_id,
        conversation_id: dto.conversation_id || null,
        platform: dto.platform || 'chat',
        source: dto.source || 'chat',
        status: dto.status || 'draft',
        total,
        items_json: dto.items,
        address_json: dto.address || {},
        notes: dto.notes || null,
        created_by: userId,
        external_id: `CHAT-${Date.now()}`,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    this.gateway.emitToTenant(tenantId, 'order.created', data);
    this.googleSheetsService.syncOrderToSheet(tenantId, data.id).catch((err) =>
      console.error('Google Sheets sync failed silently:', err),
    );

    return data;
  }

  async createFromConversation(tenantId: string, userId: string, body: CreateOrderFromConversationDto) {
    const conversationId = body?.conversation_id || body?.conversationId;
    const contactId = body?.contact_id || body?.contactId;
    const items = body?.items || [];

    if (!conversationId) {
      throw new BadRequestException('conversation_id is required');
    }

    if (!contactId) {
      throw new BadRequestException('contact_id is required');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('items must be a non-empty array');
    }

    const normalizedItems = items.map((item, index) => ({
      product_id: item.product_id || item.productId || `manual-${Date.now()}-${index}`,
      product_name: item.product_name || item.productName || item.name || 'Produit',
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || item.unitPrice || item.price || 0),
    }));

    return this.create(tenantId, userId, {
      conversation_id: conversationId,
      contact_id: contactId,
      platform: body?.platform || 'chat',
      source: body?.source || 'chat',
      status: body?.status || 'pending',
      items: normalizedItems,
      notes: body?.notes || undefined,
      total: body?.total,
      address: body?.address || body?.address_json || {},
    });
  }

  async update(tenantId: string, id: string, dto: UpdateOrderDto) {
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('orders')
      .update(dto)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    this.googleSheetsService.syncOrderToSheet(tenantId, data.id).catch((err) =>
      console.error('Google Sheets sync failed silently:', err),
    );

    if (dto.status && currentOrder?.status && dto.status !== currentOrder.status) {
      this.orderConfirmationService
        .sendConfirmation(tenantId, data.id, dto.status)
        .catch((err) => console.error('Order confirmation trigger failed:', err));
    }

    return data;
  }

  async sendWhatsAppConfirmation(tenantId: string, id: string, templateId: string) {
    await this.orderConfirmationService.sendConfirmation(tenantId, id, 'new');
    return {
      success: true,
      message: 'Confirmation queued',
      tenant_id: tenantId,
      order_id: id,
      template_id: templateId,
    };
  }
}
