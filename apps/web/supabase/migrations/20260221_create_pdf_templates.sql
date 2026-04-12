-- Migration: create pdf_templates and add refs to profiles/forms
-- Generated: 2026-02-21

CREATE TABLE IF NOT EXISTS public.pdf_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  tags text[] DEFAULT ARRAY[]::text[],
  html_css_content text NOT NULL,
  preview_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS default_template_id uuid REFERENCES public.pdf_templates(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.forms
  ADD COLUMN IF NOT EXISTS pdf_template_id uuid REFERENCES public.pdf_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pdf_templates_is_active ON public.pdf_templates(is_active);
