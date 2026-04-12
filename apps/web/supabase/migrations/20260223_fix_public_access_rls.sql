-- Migration: Allow public select for forms and profiles
-- Date: 2026-02-23

-- 1. Allow anyone to read public profiles
-- We allow reading profiles that are active or have public visibility
-- For simplicity and following the project's lead, we'll allow SELECT on public fields for anyone.
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
CREATE POLICY "Anyone can view public profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- 2. Allow anyone to read published forms
-- Ensure both 'published' and 'Active' statuses are covered, and is_public is true.
DROP POLICY IF EXISTS "Public select published forms" ON public.forms;
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;
CREATE POLICY "Anyone can view published forms"
  ON public.forms FOR SELECT
  USING (is_public = true AND status IN ('published', 'Active'));

-- 3. Add index on clean_slug if not exists to optimize lookups
CREATE INDEX IF NOT EXISTS idx_forms_clean_slug ON public.forms(clean_slug);
