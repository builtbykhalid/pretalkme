-- Migration: Add social networks and visibility fields for Personal Information
-- Date: 2026-02-06
-- Usage: Run this SQL in Supabase SQL editor or as a migration

-- Add phone country code field
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+33';

-- Add social networks as JSONB
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS social_networks JSONB DEFAULT '{
    "linkedin": "",
    "twitter": "",
    "facebook": "",
    "instagram": "",
    "youtube": "",
    "github": "",
    "other": ""
  }';

-- Add public visibility settings as JSONB
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_visibility JSONB DEFAULT '{
    "phone": false,
    "job_title": false,
    "website": false,
    "bio": false,
    "social_networks": false
  }';

-- Add indexes for JSONB fields (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_social_networks ON public.profiles USING GIN (social_networks);
CREATE INDEX IF NOT EXISTS idx_profiles_public_visibility ON public.profiles USING GIN (public_visibility);

-- Rollback (manual):
-- To rollback, run:
-- ALTER TABLE public.profiles
--   DROP COLUMN IF EXISTS phone_country_code,
--   DROP COLUMN IF EXISTS social_networks,
--   DROP COLUMN IF EXISTS public_visibility;
-- DROP INDEX IF EXISTS idx_profiles_social_networks;
-- DROP INDEX IF EXISTS idx_profiles_public_visibility;

-- Notes:
-- - social_networks stores URLs for various social media platforms
-- - public_visibility controls which profile fields are shown in public forms
-- - JSONB allows flexible addition of new social networks or visibility options