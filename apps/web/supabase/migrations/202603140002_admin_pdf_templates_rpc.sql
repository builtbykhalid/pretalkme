-- Migration: admin RPC for pdf_templates creation (RLS-safe)
-- Date: 2026-03-14

CREATE OR REPLACE FUNCTION public.admin_create_pdf_template(
  p_name text,
  p_description text DEFAULT NULL,
  p_tags text[] DEFAULT ARRAY[]::text[],
  p_html_css_content text DEFAULT '',
  p_preview_image_url text DEFAULT NULL,
  p_is_active boolean DEFAULT true
)
RETURNS public.pdf_templates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  new_row public.pdf_templates;
BEGIN
  caller_role := public.get_my_role();

  IF caller_role IS NULL OR caller_role NOT IN ('admin', 'super_admin', 'moderator') THEN
    RAISE EXCEPTION 'Access denied: admin role required'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.pdf_templates (
    name,
    description,
    tags,
    html_css_content,
    preview_image_url,
    is_active
  )
  VALUES (
    p_name,
    p_description,
    COALESCE(p_tags, ARRAY[]::text[]),
    p_html_css_content,
    p_preview_image_url,
    COALESCE(p_is_active, true)
  )
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_pdf_template(text, text, text[], text, text, boolean) TO authenticated;
