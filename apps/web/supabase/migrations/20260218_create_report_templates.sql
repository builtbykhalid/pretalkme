-- Migration: create report_templates and usage tracking

-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  html_content text,
  thumbnail_url text,
  example_pdf_url text,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  premium_tag boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- (usage tracking removed in this migration; usage can be added separately if needed)

-- No changes to leads in this migration.

-- Trigger: keep updated_at current on report_templates
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_on_report_templates ON public.report_templates;
CREATE TRIGGER set_updated_at_on_report_templates
BEFORE UPDATE ON public.report_templates
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON public.report_templates(category);
-- (no usage indexes added here)

-- Enable Row Level Security and policies
-- Enable Row Level Security
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Policy: allow authenticated users to SELECT active templates
DROP POLICY IF EXISTS "select_templates_authenticated" ON public.report_templates;
CREATE POLICY "select_templates_authenticated" ON public.report_templates
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND is_active = true
  );

-- Policy: allow admins to INSERT/UPDATE/DELETE (manage templates)
DROP POLICY IF EXISTS "manage_templates_admins" ON public.report_templates;
CREATE POLICY "manage_templates_admins" ON public.report_templates
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- For report_template_usage allow inserts by authenticated users (owner) or admin
ALTER TABLE public.report_template_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_usage_by_owner_or_admin" ON public.report_template_usage;
CREATE POLICY "insert_usage_by_owner_or_admin" ON public.report_template_usage
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  );

-- Allow select for admins on usage
DROP POLICY IF EXISTS "select_usage_admins" ON public.report_template_usage;
CREATE POLICY "select_usage_admins" ON public.report_template_usage
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Grant basic privileges to authenticated (select on public templates handled via policy)
GRANT SELECT ON public.report_templates TO authenticated;

-- End migration
