import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { ConversationsGateway } from '../conversations/conversations.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: ConversationsGateway) {}

  async findAll(tenantId: string) {
    const { data, error } = await supabase
      .from('usage_logs') // Placeholder for a real notifications table if added, or use events
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  }

  async notify(tenantId: string, payload: { title: string; message: string; type: string }) {
    // 1. Emit to Socket.io for real-time dashboard UI
    this.gateway.server.to(`tenant:${tenantId}`).emit('notification', payload);
    
    // 2. Log in DB (optional, depending on notification persistence needs)
    console.log(`Notification for ${tenantId}: ${payload.title}`);
  }
}
