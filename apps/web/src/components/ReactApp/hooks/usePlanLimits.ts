import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PLAN_LIMITS } from '@pretalkme/shared/constants/planLimits';

export type PlanId = keyof typeof PLAN_LIMITS;

export function usePlanLimits() {
  const [profile, setProfile] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile for current plan
      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan, trial_ends_at')
        .eq('id', user.id)
        .single();

      // Get usage for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const periodStart = startOfMonth.toISOString().split('T')[0];

      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_start', periodStart)
        .maybeSingle();

      setProfile(profileData || { plan: 'trial' });
      setUsage(usageData || {
        leads_count: 0,
        forms_published_count: 0,
        pdf_generations_count: 0,
        email_sends_count: 0,
        ai_generations_count: 0
      });
    } catch (err) {
      console.error('[usePlanLimits] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const plan = (profile?.plan || 'trial') as PlanId;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['trial'];

  const checkLimit = (metric: 'leads' | 'forms_published' | 'pdf_generations' | 'email_sends' | 'ai_generations') => {
    if (loading) return { allowed: true, current: 0, limit: 0 };
    
    // Map internal metric name to PLAN_LIMITS key
    const limitKeyMap: Record<string, keyof typeof limits> = {
      leads: 'conversations_month',
      forms_published: 'wa_numbers',
      pdf_generations: 'ai_credits_month',
      email_sends: 'broadcasts_month',
      ai_generations: 'ai_credits_month'
    };

    const limitKey = limitKeyMap[metric];
    const current = usage ? usage[`${metric}_count`] || 0 : 0;
    const limit = (limits as any)[limitKey];
    
    // Unlimited check
    if (limit === -1) return { allowed: true, current, limit: Infinity };
    
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current)
    };
  };

  const hasFeature = (feature: string) => {
    if (loading) return true;
    return !!(limits as any)[feature];
  };

  return {
    loading,
    plan,
    limits,
    usage,
    checkLimit,
    hasFeature,
    refresh: fetchLimits
  };
}
