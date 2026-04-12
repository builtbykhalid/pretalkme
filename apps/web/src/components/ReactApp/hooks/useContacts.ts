import { useEffect, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export function useContacts() {
  const { tenantId } = useApp();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('useContacts: Fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchContacts();

    if (!tenantId) return;

    const channel = supabase
      .channel('public:contacts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => fetchContacts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, fetchContacts]);

  const updateContact = async (id: string, updates: any) => {
    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
    return !error;
  };

  return { contacts, loading, updateContact, refresh: fetchContacts };
}
