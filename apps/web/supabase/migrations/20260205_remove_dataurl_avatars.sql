-- Migration: Remove data: (base64) avatars and company logos from profiles (Test phase)
-- Date: 2026-02-05
-- Usage: Run this SQL in Supabase SQL editor or as a migration

-- Up: Backup any profiles with data: URLs then NULLify the fields to avoid large base64 in the DB
BEGIN;

-- 1) Create a backup table to allow rollback (safe during test)
CREATE TABLE IF NOT EXISTS public.profiles_avatar_backup (
  id uuid PRIMARY KEY,
  avatar_url text,
  company_logo_url text,
  backed_up_at timestamptz DEFAULT now()
);

-- 2) Insert affected rows into backup (only profiles that contain data: URLs)
INSERT INTO public.profiles_avatar_backup (id, avatar_url, company_logo_url)
SELECT id, avatar_url, company_logo_url
FROM public.profiles
WHERE (avatar_url IS NOT NULL AND avatar_url LIKE 'data:%')
   OR (company_logo_url IS NOT NULL AND company_logo_url LIKE 'data:%');

-- 3) Nullify those fields to avoid storing heavy base64 strings
UPDATE public.profiles
SET avatar_url = NULL
WHERE avatar_url IS NOT NULL AND avatar_url LIKE 'data:%';

UPDATE public.profiles
SET company_logo_url = NULL
WHERE company_logo_url IS NOT NULL AND company_logo_url LIKE 'data:%';

COMMIT;

-- Down: Restore from backup (if present) and remove backup table
-- WARNING: only works if the backup table still exists and has the backed up values
BEGIN;

UPDATE public.profiles p
SET avatar_url = b.avatar_url,
    company_logo_url = b.company_logo_url
FROM public.profiles_avatar_backup b
WHERE p.id = b.id;

-- Optionally remove the backup table after restoration
DROP TABLE IF EXISTS public.profiles_avatar_backup;

COMMIT;

-- Notes:
-- - This migration is safe for testing: it saves original values to `profiles_avatar_backup` so you can restore them with the DOWN step.
-- - In production you might prefer to migrate data: -> Storage instead of nullifying.
-- - Run the UP step in the Supabase SQL editor or include this file in your migration pipeline.
