-- Align pdf_templates schema with current frontend/backoffice usage
-- Adds family support for new template packs and keeps backward compatibility

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS preview_image_url text;

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS template_type text;

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS family_key text DEFAULT 'default';

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS source_file text;

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS template_variables jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS created_by uuid;

ALTER TABLE IF EXISTS public.pdf_templates
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;

-- Backfill template_type where missing
UPDATE public.pdf_templates
SET template_type = CASE
  WHEN lower(name) LIKE '%audit%' THEN 'audit'
  WHEN lower(name) LIKE '%devis%' THEN 'devis'
  WHEN lower(name) LIKE '%contrat%' OR lower(name) LIKE '%contract%' THEN 'contrat'
  WHEN lower(name) LIKE '%rapport%' THEN 'rapport'
  ELSE 'custom'
END
WHERE template_type IS NULL;

UPDATE public.pdf_templates
SET family_key = 'default'
WHERE family_key IS NULL OR family_key = '';

ALTER TABLE public.pdf_templates
  ALTER COLUMN template_type SET DEFAULT 'custom';

ALTER TABLE public.pdf_templates
  ALTER COLUMN family_key SET DEFAULT 'default';

ALTER TABLE public.pdf_templates
  ALTER COLUMN template_type SET NOT NULL;

ALTER TABLE public.pdf_templates
  ADD CONSTRAINT IF NOT EXISTS chk_pdf_templates_template_type
  CHECK (template_type IN ('devis', 'audit', 'contrat', 'rapport', 'custom'));

ALTER TABLE public.pdf_templates
  ADD CONSTRAINT IF NOT EXISTS chk_pdf_templates_family_key
  CHECK (family_key IN ('default', 'data_driven', 'executive', 'storytelling', 'minimal_clarity', 'bold_impact'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_pdf_templates_source_file
  ON public.pdf_templates(source_file)
  WHERE source_file IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pdf_templates_type_family
  ON public.pdf_templates(template_type, family_key)
  WHERE is_active = true;

-- Optional RPC for advanced admin insertion with family metadata
CREATE OR REPLACE FUNCTION public.admin_create_pdf_template_v2(
  p_name text,
  p_description text DEFAULT NULL,
  p_tags text[] DEFAULT ARRAY[]::text[],
  p_html_css_content text DEFAULT '',
  p_preview_image_url text DEFAULT NULL,
  p_is_active boolean DEFAULT true,
  p_template_type text DEFAULT 'custom',
  p_family_key text DEFAULT 'default',
  p_source_file text DEFAULT NULL,
  p_template_variables jsonb DEFAULT '{}'::jsonb
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
    is_active,
    template_type,
    family_key,
    source_file,
    template_variables,
    version
  )
  VALUES (
    p_name,
    p_description,
    COALESCE(p_tags, ARRAY[]::text[]),
    p_html_css_content,
    p_preview_image_url,
    COALESCE(p_is_active, true),
    COALESCE(p_template_type, 'custom'),
    COALESCE(p_family_key, 'default'),
    p_source_file,
    COALESCE(p_template_variables, '{}'::jsonb),
    1
  )
  ON CONFLICT (source_file)
  DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    html_css_content = EXCLUDED.html_css_content,
    preview_image_url = EXCLUDED.preview_image_url,
    is_active = EXCLUDED.is_active,
    template_type = EXCLUDED.template_type,
    family_key = EXCLUDED.family_key,
    template_variables = EXCLUDED.template_variables,
    updated_at = now(),
    version = COALESCE(public.pdf_templates.version, 1) + 1
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_pdf_template_v2(text, text, text[], text, text, boolean, text, text, text, jsonb) TO authenticated;
