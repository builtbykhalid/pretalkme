-- Migration: Add extra profile fields for Personal Information
-- Date: 2026-02-05
-- Usage: Run this SQL in Supabase SQL editor or as a migration

-- Add simple text fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Notification preferences as JSONB with sensible defaults
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"newLead": true, "weeklyReport": true, "marketing": false}';

-- Add indexes (optional) to speed up queries by locale/timezone
CREATE INDEX IF NOT EXISTS idx_profiles_locale ON public.profiles (locale);
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON public.profiles (timezone);

-- Optional: Ensure avatar_url and company_logo_url columns exist (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Rollback (manual):
-- To rollback, run:
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone, DROP COLUMN IF EXISTS website, DROP COLUMN IF EXISTS bio, DROP COLUMN IF EXISTS locale, DROP COLUMN IF EXISTS timezone, DROP COLUMN IF EXISTS notification_preferences;
-- DROP INDEX IF EXISTS idx_profiles_locale;
-- DROP INDEX IF EXISTS idx_profiles_timezone;

-- Notes:
-- - notification_preferences is stored as JSONB to allow flexible preference additions.
-- - Consider adding RLS policy updates if needed to allow reading public profile fields for Public Forms.
