-- Migration: Fix case-insensitive slug matching in RPC function
-- The slug comparison was case-sensitive, causing forms not to be found
-- when the URL slug doesn't exactly match the stored slug casing.

DROP FUNCTION IF EXISTS get_public_form_by_username_and_slug(TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_public_form_by_username_and_slug(p_username TEXT, p_slug TEXT)
RETURNS SETOF public_forms_view LANGUAGE sql STABLE AS $$
  SELECT * FROM public_forms_view
  WHERE LOWER(username) = LOWER(p_username) 
    AND (LOWER(slug) = LOWER(p_slug) OR LOWER(clean_slug) = LOWER(p_slug))
  LIMIT 1;
$$;
