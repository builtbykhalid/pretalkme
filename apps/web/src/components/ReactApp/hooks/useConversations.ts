import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../stores/useChatStore';
import { useApp } from '../context/AppContext';

export function useConversations() {
  const { tenantId } = useApp();
  const { setConversations, updateConversation } = useChatStore();

  const fetchConversations = useCallback(async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts (*)
        `)
        .eq('tenant_id', tenantId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      // Map to the frontend type expected by the store
      const mapped = data.map(conv => ({
        ...conv,
        contact_name: conv.contact?.name,
        contact_phone: conv.contact?.phone,
      }));

      setConversations(mapped);
    } catch (err) {
      console.error('useConversations: Fetch error', err);
    }
  }, [tenantId, setConversations]);

  useEffect(() => {
    fetchConversations();

    if (!tenantId) return;

    // Real-time subscription
    const channel = supabase
      .channel('public:conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            fetchConversations(); // Simpler to refetch for now to get joins
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, fetchConversations]);

  return { refresh: fetchConversations };
}
