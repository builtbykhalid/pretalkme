-- Migration: Add form enhancements
-- Adds description, thank you page customization, and section settings

-- Add description to forms
ALTER TABLE forms ADD COLUMN IF NOT EXISTS description text;

-- Add thank you page customization
ALTER TABLE forms ADD COLUMN IF NOT EXISTS thank_you_title text;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS thank_you_description text;

-- Add section settings
ALTER TABLE forms ADD COLUMN IF NOT EXISTS sections_enabled boolean DEFAULT false;

-- Add design config extensions (transparency/blur)
-- Note: These will likely go into the existing design_config jsonb, 
-- but we might want explicit columns if needed for performance.
-- For now, we'll stick to jsonb for design config as per existing pattern.

-- Recreate public_forms_view to include new columns
DROP FUNCTION IF EXISTS get_public_form_by_username_and_slug(TEXT, TEXT);
DROP VIEW IF EXISTS public_forms_view CASCADE;

CREATE VIEW public_forms_view AS
SELECT
  f.id AS form_id, f.user_id, p.id AS profile_id, p.username, p.first_name, p.last_name, 
  p.avatar_url, p.job_title, p.bio, p.website, p.social_networks, p.public_visibility, 
  p.page_config, p.custom_links, 
  p.booking_config AS profile_booking_config, 
  p.steps_config AS profile_steps_config,
  f.title, f.slug, f.clean_slug, f.description, 
  f.thank_you_title, f.thank_you_description, f.sections_enabled,
  f.thank_you_services, f.show_services_on_thank_you, f.is_paid, f.consultant_cost,
  f.form_structure, f.design_config, 
  f.steps_config, f.booking_config, f.created_at, f.updated_at
FROM forms f
JOIN profiles p ON p.id = f.user_id
WHERE f.is_public = TRUE;

-- Recreate the RPC function for public forms
CREATE OR REPLACE FUNCTION get_public_form_by_username_and_slug(p_username TEXT, p_slug TEXT)
RETURNS SETOF public_forms_view LANGUAGE sql STABLE AS $$
  SELECT * FROM public_forms_view
  WHERE LOWER(username) = LOWER(p_username) AND (slug = p_slug OR clean_slug = p_slug)
  LIMIT 1;
$$;
