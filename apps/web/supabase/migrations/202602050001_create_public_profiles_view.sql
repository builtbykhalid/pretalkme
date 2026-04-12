-- Migration: create public_profiles view and open SELECT policy
-- Date: 2026-02-05
-- Purpose: expose a safe, read-only view for public forms and anonymous reads

-- Drop existing view if present (idempotent)
DROP VIEW IF EXISTS public.public_profiles;

-- Create view exposing only safe fields
CREATE VIEW public.public_profiles AS
SELECT
  id,
  first_name,
  last_name,
  full_name,
  job_title,
  avatar_url,
  company_logo_url,
  company_name
FROM public.profiles
WHERE account_status = 'active';

-- Remove old policy if present and create a public SELECT policy on the view
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'public_profiles' AND policyname = 'public_profiles_select_public'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "public_profiles_select_public" ON public.public_profiles';
  END IF;
END;
$$;

CREATE POLICY "public_profiles_select_public"
  ON public.public_profiles FOR SELECT
  USING (true);

-- Note: `public.profiles` can keep owner-only RLS policies; this view provides a safe public read path.
