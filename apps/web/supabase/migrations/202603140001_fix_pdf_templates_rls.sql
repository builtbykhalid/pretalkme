-- Migration: fix pdf_templates RLS policies for admin backoffice CRUD
-- Date: 2026-03-14

ALTER TABLE IF EXISTS public.pdf_templates ENABLE ROW LEVEL SECURITY;

-- Remove previous/legacy policies if present
DROP POLICY IF EXISTS "Anyone can view active pdf templates" ON public.pdf_templates;
DROP POLICY IF EXISTS "select_pdf_templates_public_active" ON public.pdf_templates;
DROP POLICY IF EXISTS "manage_pdf_templates_admins" ON public.pdf_templates;

-- Public/app read access: non-admin users can read only active templates.
-- Admins can read all templates (active + inactive) for backoffice management.
CREATE POLICY "select_pdf_templates_public_active" ON public.pdf_templates
  FOR SELECT
  USING (
    is_active = true
    OR get_my_role() IN ('admin', 'super_admin', 'moderator')
  );

-- Admin write access for /admin backoffice CRUD
CREATE POLICY "manage_pdf_templates_admins" ON public.pdf_templates
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'super_admin', 'moderator')
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'super_admin', 'moderator')
  );

-- Explicit grants (RLS still applies)
GRANT SELECT ON public.pdf_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdf_templates TO authenticated;
