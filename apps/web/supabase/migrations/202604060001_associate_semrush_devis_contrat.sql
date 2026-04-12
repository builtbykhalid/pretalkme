-- Associate the existing Semrush audit template with devis and contrat variants
-- This keeps the Semrush family consistent across all PDF types without changing other families.

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
  version,
  created_by
)
SELECT
  'Devis Semrush Template',
  'Semrush family devis template cloned from the existing audit Semrush template',
  COALESCE(src.tags, ARRAY[]::text[]) || ARRAY['semrush', 'devis']::text[],
  src.html_css_content,
  src.preview_image_url,
  true,
  'devis',
  'default',
  'devis_semrush_template.html',
  COALESCE(src.template_variables, '{}'::jsonb),
  COALESCE(src.version, 1),
  src.created_by
FROM public.pdf_templates AS src
WHERE src.source_file = 'audit_semrush_template.html'
  AND NOT EXISTS (
    SELECT 1
    FROM public.pdf_templates t
    WHERE t.source_file = 'devis_semrush_template.html'
  );

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
  version,
  created_by
)
SELECT
  'Contrat Semrush Template',
  'Semrush family contrat template cloned from the existing audit Semrush template',
  COALESCE(src.tags, ARRAY[]::text[]) || ARRAY['semrush', 'contrat']::text[],
  src.html_css_content,
  src.preview_image_url,
  true,
  'contrat',
  'default',
  'contrat_semrush_template.html',
  COALESCE(src.template_variables, '{}'::jsonb),
  COALESCE(src.version, 1),
  src.created_by
FROM public.pdf_templates AS src
WHERE src.source_file = 'audit_semrush_template.html'
  AND NOT EXISTS (
    SELECT 1
    FROM public.pdf_templates t
    WHERE t.source_file = 'contrat_semrush_template.html'
  );
