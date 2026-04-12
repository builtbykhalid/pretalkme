-- Migration: ensure expected columns exist on profiles
-- Date: 2026-02-05
-- Purpose: make schema compatible with application code (idempotent)

ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"newLead": true, "weeklyReport": true, "marketing": false}'::jsonb;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS billing_details JSONB DEFAULT '{"plan": "free"}'::jsonb;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Optional: create indexes used by code
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON public.profiles(custom_domain) WHERE custom_domain IS NOT NULL;
