import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../stores/useChatStore';
import { SOCKET_EVENTS } from '@pretalkme/shared/constants/socketEvents';

export function useSocket(tenantId: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const initSocket = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:4000', {
        auth: { token: session.access_token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit(SOCKET_EVENTS.JOIN_INBOX, tenantId);
      });

      socket.on(SOCKET_EVENTS.MESSAGE_NEW, (msg) => {
        useChatStore.getState().addMessage(msg);
      });

      socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, (conv) => {
        useChatStore.getState().updateConversation(conv.id, conv);
      });

      socket.on(SOCKET_EVENTS.AI_THINKING, (data) => {
        useChatStore.getState().setTyping(data.conversationId, true);
      });

      socket.on(SOCKET_EVENTS.HIT_TRIGGERED, (data) => {
        useChatStore.getState().markHITL(data.conversationId, data.reason);
        // Toast notification à l'agent
      });

      socketRef.current = socket;
    };

    initSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [tenantId]);

  return socketRef.current;
}
