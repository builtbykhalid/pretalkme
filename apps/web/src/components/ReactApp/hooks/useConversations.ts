import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../stores/useChatStore';
import { useApp } from '../context/AppContext';

export function useConversations() {
  const { tenantId } = useApp();
  const { setConversations, updateConversation } = useChatStore();

  const fetchConversations = useCallback(async () => {
    if (!tenantId) { console.log('[useConversations] tenantId is null, skipping'); return; }
    console.log('[useConversations] Fetching for tenant:', tenantId);

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts (*)
        `)
        .eq('tenant_id', tenantId)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      console.log('[useConversations] Result:', { data, error });
      if (error) throw error;

      const mapped = (data || []).map(conv => ({
        ...conv,
        contact_name: conv.contact?.name,
        contact_phone: conv.contact?.phone,
      }));

      console.log('[useConversations] Mapped conversations:', mapped.length);
      setConversations(mapped);
    } catch (err) {
      console.error('useConversations: Fetch error', err);
    }
  }, [tenantId, setConversations]);

  useEffect(() => {
    fetchConversations();

    if (!tenantId) return;

    // Polling fallback every 5s for new conversations/updates
    const poll = setInterval(fetchConversations, 5000);

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
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [tenantId, fetchConversations]);

  return { refresh: fetchConversations };
}
