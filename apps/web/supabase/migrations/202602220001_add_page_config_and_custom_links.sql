-- ============================================================
-- Migration: Add page_config and custom_links to profiles
-- + Update public_forms_view to expose them
-- ============================================================
-- Run this in Supabase SQL Editor

-- ─── 1. Add new JSONB columns to profiles ───
-- page_config: stores theme, color, font, layout, hero_shape
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS page_config JSONB DEFAULT '{"theme":"dark","color":"#48D951","font":"inter","layout":"classic"}'::jsonb;

-- custom_links: array of {label, url} objects
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb;

-- ─── 2. Recreate public_forms_view to include profile fields needed by PublicProfile ───
-- Drop the dependent function first to avoid errors
DROP FUNCTION IF EXISTS get_public_form_by_username_and_slug(TEXT, TEXT);
DROP VIEW IF EXISTS public_forms_view;

CREATE VIEW public_forms_view AS
SELECT
  f.id AS form_id,
  f.user_id,
  p.id AS profile_id,
  p.username,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.job_title,
  p.bio,
  p.website,
  p.social_networks,
  p.public_visibility,
  p.page_config,
  p.custom_links,
  f.title,
  f.slug,
  f.clean_slug,
  f.description,
  f.form_structure,
  f.design_config,
  f.steps_config,
  f.booking_config,
  f.created_at,
  f.updated_at
FROM forms f
JOIN profiles p ON p.id = f.user_id
WHERE f.is_public = TRUE;

-- ─── 3. Recreate the RPC function ───
CREATE OR REPLACE FUNCTION get_public_form_by_username_and_slug(p_username TEXT, p_slug TEXT)
RETURNS SETOF public_forms_view LANGUAGE sql STABLE AS $$
  SELECT * FROM public_forms_view
  WHERE LOWER(username) = LOWER(p_username) AND (slug = p_slug OR clean_slug = p_slug)
  LIMIT 1;
$$;

-- ─── 4. Optional: update public_profiles view too ───
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT
  id,
  username,
  first_name,
  last_name,
  full_name,
  job_title,
  bio,
  website,
  avatar_url,
  company_logo_url,
  company_name,
  social_networks,
  public_visibility,
  page_config,
  custom_links
FROM public.profiles
WHERE account_status = 'active';

-- ─── Done! ───
-- Verify by running: SELECT * FROM public_forms_view LIMIT 5;
