-- ============================================================
-- Migration: Optimize Profile Booking & Social Networks DnD
-- Date: 2026-02-23
-- Description: 
-- 1. Updates social_networks to support ordered arrays (DnD)
-- 2. Adds booking and steps configuration directly to profiles
-- 3. Decouples bookings from mandatory forms
-- 4. Updates public views (forms & profiles)
-- ============================================================

-- 1. Add Booking & Steps Config to Profiles
-- This allows users to have a global calendar config for their profile page
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS steps_config JSONB DEFAULT '{
    "steps_order": ["calendar", "form", "ai"],
    "calendar_enabled": true,
    "form_enabled": false,
    "ai_enabled": false,
    "intro_enabled": false,
    "calendar_first": true
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS booking_config JSONB DEFAULT '{
    "duration_minutes": 30,
    "booking_display_mode": "native",
    "timezone": "Europe/Paris"
  }'::jsonb;

-- 2. Make form_id optional in bookings table
-- This allows bookings to be created directly via the public profile
ALTER TABLE public.bookings 
  ALTER COLUMN form_id DROP NOT NULL;

-- 3. Update social_networks column type/default if necessary
-- Ensure it's JSONB and defaults to an empty array for the new DnD logic
ALTER TABLE public.profiles 
  ALTER COLUMN social_networks SET DEFAULT '[]'::jsonb;

-- 4. Recreate public_forms_view to include new profile fields
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
  p.booking_config AS profile_booking_config,
  p.steps_config AS profile_steps_config,
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

-- 5. Recreate the RPC function for public forms
CREATE OR REPLACE FUNCTION get_public_form_by_username_and_slug(p_username TEXT, p_slug TEXT)
RETURNS SETOF public_forms_view LANGUAGE sql STABLE AS $$
  SELECT * FROM public_forms_view
  WHERE LOWER(username) = LOWER(p_username) AND (slug = p_slug OR clean_slug = p_slug)
  LIMIT 1;
$$;

-- 6. Update public.public_profiles view
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
  custom_links,
  steps_config,
  booking_config
FROM public.profiles
WHERE account_status = 'active';

-- 7. Add comments for documentation
COMMENT ON COLUMN public.profiles.steps_config IS 'Order and activation of steps for the personal profile page';
COMMENT ON COLUMN public.profiles.booking_config IS 'Global calendar settings for the personal profile page';
COMMENT ON COLUMN public.bookings.form_id IS 'Optional: reference to form. Null for direct profile bookings.';
