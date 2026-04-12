-- Migration: Création des tables pour les annonces In-App (Marketing Hub)
-- Date: 2026-03-01

-- 1. Table in_app_announcements
CREATE TABLE IF NOT EXISTS public.in_app_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_type TEXT NOT NULL CHECK (layout_type IN ('top_banner', 'split_modal', 'sidebar_card')),
    title TEXT NOT NULL, -- Internal title
    content_title TEXT NOT NULL, -- Displayed title
    content_text TEXT, -- Description
    cta_text TEXT, -- Button text
    cta_link TEXT, -- Button URL
    image_url TEXT, -- Optional image for modal
    theme_color TEXT DEFAULT '#4f46e5', -- HEX color for background
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'free_only', 'pro_only')),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for in_app_announcements
ALTER TABLE public.in_app_announcements ENABLE ROW LEVEL SECURITY;

-- Admins can do everything on announcements
CREATE POLICY "Admins can manage in-app announcements" 
ON public.in_app_announcements FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Everyone can read active announcements
CREATE POLICY "Anyone can read active in-app announcements" 
ON public.in_app_announcements FOR SELECT 
USING (is_active = true);


-- 2. Table user_dismissed_announcements
CREATE TABLE IF NOT EXISTS public.user_dismissed_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES public.in_app_announcements(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, announcement_id) -- Ensure user can only dismiss once
);

-- Enable RLS for user_dismissed_announcements
ALTER TABLE public.user_dismissed_announcements ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own dismissals
CREATE POLICY "Users can insert their own dismissals" 
ON public.user_dismissed_announcements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only read their own dismissals
CREATE POLICY "Users can read their own dismissals" 
ON public.user_dismissed_announcements FOR SELECT 
USING (auth.uid() = user_id);

-- Trigger to update updated_at on in_app_announcements
CREATE OR REPLACE FUNCTION update_in_app_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_in_app_announcements_updated_at_trigger
BEFORE UPDATE ON public.in_app_announcements
FOR EACH ROW
EXECUTE FUNCTION update_in_app_announcements_updated_at();
