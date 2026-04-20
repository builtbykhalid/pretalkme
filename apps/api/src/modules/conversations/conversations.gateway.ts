import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust to process.env.CORS_ORIGIN
    credentials: true,
  },
  namespace: '/',
})
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      // Validate token and get tenant
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) {
        client.disconnect();
        return;
      }

      const { data: userRecord } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userRecord) {
        client.disconnect();
        return;
      }

      // Join tenant room
      const tenantId = userRecord.tenant_id;
      client.data.tenantId = tenantId;
      client.data.userId = user.id;
      client.join(`tenant:${tenantId}`);
      
      console.log(`Socket: User ${user.id} joined tenant room ${tenantId}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket: Client disconnected ${client.id}`);
  }

  // Real-time emitters
  emitNewMessage(tenantId: string, message: any) {
    this.server.to(`tenant:${tenantId}`).emit('message.new', message);
  }

  emitConversationUpdated(tenantId: string, conversation: any) {
    this.server.to(`tenant:${tenantId}`).emit('conversation.updated', conversation);
  }

  emitAIThinking(tenantId: string, conversationId: string) {
    this.server.to(`tenant:${tenantId}`).emit('ai.thinking', { conversationId });
  }

  emitToTenant(tenantId: string, event: string, payload: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, payload);
  }

  emitWAQRUpdated(tenantId: string, qrBase64: string) {
    this.server.to(`tenant:${tenantId}`).emit('wa.qr_updated', { tenantId, qrBase64 });
  }

  emitWAStatusChanged(tenantId: string, status: string) {
    this.server.to(`tenant:${tenantId}`).emit('wa.status_changed', { tenantId, status });
  }

  emitCampaignProgress(tenantId: string, payload: { campaignId: string; sentCount: number; total: number; failedCount: number }) {
    this.server.to(`tenant:${tenantId}`).emit('campaign.progress', payload);
  }
}
