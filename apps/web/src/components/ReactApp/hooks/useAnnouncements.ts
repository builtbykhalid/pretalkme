import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PLAN_LIMITS } from '@pretalkme/shared/constants/planLimits';

export type Announcement = {
    id: string;
    layout_type: 'top_banner' | 'split_modal' | 'sidebar_card' | 'bottom_right_card';
    title: string;
    content_title: string;
    content_text: string | null;
    cta_text: string | null;
    cta_link: string | null;
    image_url: string | null;
    theme_color: string;
    target_audience: 'all' | 'free_only' | 'pro_only';
    delay_seconds: number;
    target_path: string | null;
    dismiss_behavior: 'once' | 'per_session' | 'always';
    repeat_after_hours: number | null;
};

// Use session storage for session-based dismissals
const SESSION_DISMISSED_KEY = 'pretalk_session_dismissed_announcements';
const COOLDOWN_KEY = 'pretalk_announcement_cooldown_active';

export function useAnnouncements() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [cooldown, setCooldown] = useState(false);

    // Track session-dismissed IDs
    const [sessionDismissed, setSessionDismissed] = useState<Set<string>>(() => {
        try {
            const stored = sessionStorage.getItem(SESSION_DISMISSED_KEY);
            return new Set(stored ? JSON.parse(stored) : []);
        } catch { return new Set(); }
    });

    useEffect(() => {
        sessionStorage.setItem(SESSION_DISMISSED_KEY, JSON.stringify(Array.from(sessionDismissed)));
    }, [sessionDismissed]);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchAnnouncements = async () => {
            setLoading(true);
            try {
                // 1. Get user plan status
                // We assume Pro if they have an active subscription
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('status')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .maybeSingle();

                const isPro = !!subData;

                // 2. Fetch active announcements
                const { data: activeAnns } = await supabase
                    .from('in_app_announcements')
                    .select('*')
                    .eq('is_active', true);

                if (!activeAnns || activeAnns.length === 0) {
                    setAnnouncements([]);
                    setLoading(false);
                    return;
                }

                // 3. Fetch dismissed announcements
                const { data: dismissedData } = await supabase
                    .from('user_dismissed_announcements')
                    .select('announcement_id')
                    .eq('user_id', user.id);

                const dismissedIds = new Set(dismissedData?.map(d => d.announcement_id) || []);

                // 4. Filter announcements
                const currentPath = window.location.pathname;

                const filtered = activeAnns.filter(ann => {
                    // 1. Check Permanent Dismissal (Database)
                    if (dismissedIds.has(ann.id) && (ann.dismiss_behavior === 'once' || !ann.dismiss_behavior)) {
                        return false;
                    }

                    // 2. Check Session Dismissal (Internal State)
                    if (sessionDismissed.has(ann.id) && ann.dismiss_behavior !== 'always') {
                        return false;
                    }

                    // 3. Check Audience
                    if (ann.target_audience === 'free_only' && isPro) return false;
                    if (ann.target_audience === 'pro_only' && !isPro) return false;

                    // 4. Check Path Targeting
                    if (ann.target_path && ann.target_path.trim() !== '') {
                        if (!currentPath.startsWith(ann.target_path)) {
                            return false;
                        }
                    }

                    return true;
                });

                // 5. Add System/Quota Announcements
                const systemAnns: Announcement[] = [];
                
                // Get usage to check for local warnings
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                const periodStart = startOfMonth.toISOString().split('T')[0];

                const { data: usage } = await supabase
                    .from('usage_tracking')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('period_start', periodStart)
                    .maybeSingle();

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan, trial_ends_at')
                    .eq('id', user.id)
                    .single();

                const currentPlan = profile?.plan || 'trial';
                const limits = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS];
                
                // Trial Warning
                if (currentPlan === 'trial' && profile?.trial_ends_at) {
                    const daysLeft = Math.ceil((new Date(profile.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    if (daysLeft <= 3 && daysLeft > 0) {
                        systemAnns.push({
                            id: 'system_trial_expiring',
                            layout_type: 'top_banner',
                            title: 'Essai expire bientôt',
                            content_title: `Votre essai gratuit se termine dans ${daysLeft} jours`,
                            content_text: 'Passez au plan Starter pour conserver vos accès.',
                            cta_text: 'Passer au Starter',
                            cta_link: '/settings/billing',
                            image_url: null,
                            theme_color: '#F59E0B',
                            target_audience: 'all',
                            delay_seconds: 0,
                            target_path: null,
                            dismiss_behavior: 'per_session',
                            repeat_after_hours: 24
                        });
                    }
                }

                // Quota Warning
                if (usage && limits && (currentPlan === 'trial' || currentPlan === 'starter')) {
                    if (usage.leads_count >= (limits as any).conversations_month) {
                        systemAnns.push({
                            id: 'system_quota_reached',
                            layout_type: 'split_modal',
                            title: 'Quota atteint',
                            content_title: 'Vous avez atteint votre limite de leads',
                            content_text: 'Vos nouveaux leads sont capturés mais restent verrouillés. Passez à la version Pro pour débloquer tous vos prospects en illimité.',
                            cta_text: 'Débloquer maintenant',
                            cta_link: '/settings/billing',
                            image_url: 'https://img.freepik.com/free-vector/boost-business-profit-with-rocket-startup_1017-31766.jpg',
                            theme_color: '#7C3AED',
                            target_audience: 'all',
                            delay_seconds: 2,
                            target_path: '/dashboard',
                            dismiss_behavior: 'per_session',
                            repeat_after_hours: 1
                        });
                    }
                }

                // 6. Store combined
                setAnnouncements([...filtered, ...systemAnns] as Announcement[]);

            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [user]);

    const dismissAnnouncement = async (id: string) => {
        if (!user) return;

        const announcement = announcements.find(a => a.id === id);
        const behavior = announcement?.dismiss_behavior || 'once';

        // 1. Update Session State
        setSessionDismissed(prev => new Set([...Array.from(prev), id]));

        // 2. Clear from active list optimistically
        setAnnouncements(prev => prev.filter(a => a.id !== id));

        // 3. Set cooldown for next popup if session has multiple
        setCooldown(true);
        setTimeout(() => setCooldown(false), 3000); // 3-second cooldown between popups

        // 4. If behavior is 'once' (permanent), save to DB
        if (behavior === 'once') {
            const { error } = await supabase
                .from('user_dismissed_announcements')
                .insert({
                    user_id: user.id,
                    announcement_id: id
                });

            if (error) {
                console.warn('Could not dismiss announcement:', error);
            }
        }

        // 5. Track dismiss event
        trackEvent(id, 'dismiss');
    };

    const trackEvent = async (id: string, eventType: 'view' | 'click' | 'dismiss') => {
        if (!user) return;

        // Prevent duplicate views in current session by simply not awaiting
        // In a strict prod app we'd use a Set to deduplicate views per session
        supabase.from('announcement_events').insert({
            announcement_id: id,
            user_id: user.id,
            event_type: eventType
        }).then(({ error }) => {
            if (error) console.warn(`Could not track ${eventType} event:`, error);
        });
    };

    // Helper to get highest priority overlay (Modal > Banner > Bottom Right Card)
    const priorityAnnouncement = cooldown ? null : (
        announcements.find(a => a.layout_type === 'split_modal')
        || announcements.find(a => a.layout_type === 'bottom_right_card')
        || announcements.find(a => a.layout_type === 'top_banner')
        || null
    );

    // Helper to get sidebar card
    const sidebarAnnouncement = announcements.find(a => a.layout_type === 'sidebar_card') || null;

    return {
        announcements,
        priorityAnnouncement,
        sidebarAnnouncement,
        dismissAnnouncement,
        trackEvent,
        loading
    };
}
