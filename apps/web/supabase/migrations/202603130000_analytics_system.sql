-- Migration: Create Analytics System for Consultants
-- Description: Table for tracking public profile/form engagement with rich dimensions

-- 1. Table schema
CREATE TABLE IF NOT EXISTS public_analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'page_view', 'form_start', 'form_complete', 'link_click'
    metadata JSONB DEFAULT '{}'::jsonb, -- { source, country, city, language, url, device, referrer }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Security (RLS)
ALTER TABLE public_analytics_events ENABLE ROW LEVEL SECURITY;

-- Anonymous users (and anyone else) can ONLY insert events
CREATE POLICY "Allow public tracking" ON public_analytics_events
    FOR INSERT 
    WITH CHECK (true);

-- Consultants can ONLY see events related to their own profile
CREATE POLICY "Consultants can view their own analytics" ON public_analytics_events
    FOR SELECT 
    USING (auth.uid() = profile_id);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON public_analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_form_id ON public_analytics_events(form_id);

-- 4. Aggregation Function (RPC)
CREATE OR REPLACE FUNCTION get_consultant_stats(
    p_profile_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT now() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    p_form_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_views', COUNT(*) FILTER (WHERE event_type = 'page_view'),
        'total_starts', COUNT(*) FILTER (WHERE event_type = 'form_start'),
        'total_submissions', COUNT(*) FILTER (WHERE event_type = 'form_complete'),
        'unique_visitors', COUNT(DISTINCT (metadata->>'visitor_id')),
        'conversion_rate', CASE 
            WHEN COUNT(*) FILTER (WHERE event_type = 'page_view') > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE event_type = 'form_complete')::NUMERIC / COUNT(*) FILTER (WHERE event_type = 'page_view')::NUMERIC) * 100, 2)
            ELSE 0 
        END,
        'by_country', (
            SELECT jsonb_object_agg(country, count)
            FROM (
                SELECT COALESCE(metadata->>'country', 'Unknown') as country, COUNT(*) as count
                FROM public_analytics_events
                WHERE profile_id = p_profile_id 
                AND event_type = 'page_view' 
                AND created_at BETWEEN p_start_date AND p_end_date
                AND (p_form_id IS NULL OR form_id = p_form_id)
                GROUP BY 1
                ORDER BY 2 DESC
                LIMIT 5
            ) s
        ),
        'by_source', (
            SELECT jsonb_object_agg(source, count)
            FROM (
                SELECT COALESCE(metadata->>'source', 'Direct') as source, COUNT(*) as count
                FROM public_analytics_events
                WHERE profile_id = p_profile_id 
                AND event_type = 'page_view' 
                AND created_at BETWEEN p_start_date AND p_end_date
                AND (p_form_id IS NULL OR form_id = p_form_id)
                GROUP BY 1
                ORDER BY 2 DESC
                LIMIT 5
            ) s
        ),
        'devices', (
            SELECT jsonb_build_object(
                'mobile', COUNT(*) FILTER (WHERE metadata->>'device' = 'mobile'),
                'desktop', COUNT(*) FILTER (WHERE metadata->>'device' = 'desktop' OR metadata->>'device' IS NULL)
            )
            FROM public_analytics_events
            WHERE profile_id = p_profile_id 
            AND event_type = 'page_view'
            AND created_at BETWEEN p_start_date AND p_end_date
            AND (p_form_id IS NULL OR form_id = p_form_id)
        ),
        'daily_engagement', (
            SELECT jsonb_agg(d)
            FROM (
                SELECT 
                    to_char(created_at, 'DD/MM') as day,
                    COUNT(*) FILTER (WHERE event_type = 'page_view') as views,
                    COUNT(*) FILTER (WHERE event_type = 'form_complete') as conversions
                FROM public_analytics_events
                WHERE profile_id = p_profile_id 
                AND created_at BETWEEN p_start_date AND p_end_date
                AND (p_form_id IS NULL OR form_id = p_form_id)
                GROUP BY to_char(created_at, 'DD/MM'), date_trunc('day', created_at)
                ORDER BY date_trunc('day', created_at)
            ) d
        )
    ) INTO v_stats
    FROM public_analytics_events
    WHERE profile_id = p_profile_id
    AND created_at BETWEEN p_start_date AND p_end_date
    AND (p_form_id IS NULL OR form_id = p_form_id);
    
    RETURN v_stats;
END;
$$;
