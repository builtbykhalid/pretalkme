import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../stores/useChatStore';
import { useApp } from '../context/AppContext';

export function useMessages(conversationId: string | null) {
  const { tenantId } = useApp();
  const { addMessage, setMessages } = useChatStore();

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !tenantId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (err) {
      console.error('useMessages: Fetch error', err);
    }
  }, [conversationId, tenantId, setMessages]);

  useEffect(() => {
    fetchMessages();

    if (!conversationId || !tenantId) return;

    const channel = supabase
      .channel(`public:messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          addMessage(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, tenantId, fetchMessages, addMessage]);

  return { refresh: fetchMessages };
}
