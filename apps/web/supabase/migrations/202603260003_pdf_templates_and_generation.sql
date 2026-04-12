-- PDF Generation & Template Management Tables
-- Supports template storage, generation tracking, and PDF audit logging

-- Create pdf_templates table
CREATE TABLE IF NOT EXISTS public.pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('devis', 'audit', 'contrat', 'rapport', 'custom')),
  html_css_content TEXT NOT NULL,
  template_variables JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_pdf_templates_type ON public.pdf_templates(template_type);
CREATE INDEX idx_pdf_templates_active ON public.pdf_templates(is_active);
CREATE INDEX idx_pdf_templates_created_by ON public.pdf_templates(created_by);

-- Create pdf_generation_logs table (audit trail)
CREATE TABLE IF NOT EXISTS public.pdf_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'sent')),
  pdf_path TEXT,
  pdf_size_bytes INTEGER,
  generation_time_ms INTEGER,
  error_message TEXT,
  user_id UUID,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_pdf_generation_logs_lead ON public.pdf_generation_logs(lead_id);
CREATE INDEX idx_pdf_generation_logs_template ON public.pdf_generation_logs(template_id);
CREATE INDEX idx_pdf_generation_logs_status ON public.pdf_generation_logs(status);
CREATE INDEX idx_pdf_generation_logs_date ON public.pdf_generation_logs(generated_at DESC);

-- Create pdf_template_usage table (analytics)
CREATE TABLE IF NOT EXISTS public.pdf_template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE CASCADE,
  lead_count INTEGER DEFAULT 0,
  successful_generations INTEGER DEFAULT 0,
  failed_generations INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_pdf_template_usage_template ON public.pdf_template_usage(template_id);

-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_template_usage ENABLE ROW LEVEL SECURITY;

-- PDF Templates: Admins manage, others view
CREATE POLICY "Anyone can view active templates" 
  ON public.pdf_templates 
  FOR SELECT 
  USING (is_active = true OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage templates" 
  ON public.pdf_templates 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- PDF Generation Logs: Admin view only
CREATE POLICY "Admins can view all PDF generation logs" 
  ON public.pdf_generation_logs 
  FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own lead PDFs" 
  ON public.pdf_generation_logs 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT assigned_to FROM public.leads WHERE id = lead_id
    )
  );

-- PDF Template Usage: Admin view only
CREATE POLICY "Admins can view template usage" 
  ON public.pdf_template_usage 
  FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

-- ════════════════════════════════════════════════════════════════
-- UTILITY FUNCTIONS
-- ════════════════════════════════════════════════════════════════

-- Get PDF generation statistics for a template
CREATE OR REPLACE FUNCTION get_template_stats(template_uuid UUID)
RETURNS TABLE (
  template_id UUID,
  total_generated BIGINT,
  successful BIGINT,
  failed BIGINT,
  success_rate NUMERIC,
  avg_generation_time_ms NUMERIC,
  last_used TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    template_uuid,
    COUNT(*) as total_generated,
    COUNT(*) FILTER (WHERE status = 'success') as successful,
    COUNT(*) FILTER (WHERE status = 'error') as failed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / NULLIF(COUNT(*), 0), 2) as success_rate,
    ROUND(AVG(generation_time_ms)::NUMERIC, 2) as avg_generation_time_ms,
    MAX(generated_at) as last_used
  FROM public.pdf_generation_logs
  WHERE template_id = template_uuid
  GROUP BY template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get PDF generation statistics for a lead
CREATE OR REPLACE FUNCTION get_lead_pdf_stats(lead_uuid UUID)
RETURNS TABLE (
  lead_id UUID,
  total_pdfs BIGINT,
  successful BIGINT,
  failed BIGINT,
  templates_used TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lead_uuid,
    COUNT(*) as total_pdfs,
    COUNT(*) FILTER (WHERE status = 'success') as successful,
    COUNT(*) FILTER (WHERE status = 'error') as failed,
    ARRAY_AGG(DISTINCT template_id::TEXT) as templates_used
  FROM public.pdf_generation_logs
  WHERE lead_id = lead_uuid
  GROUP BY lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old PDF generation logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_pdf_logs()
RETURNS TABLE (deleted_count BIGINT)
AS $$
BEGIN
  DELETE FROM public.pdf_generation_logs
  WHERE generated_at < NOW() - INTERVAL '90 days';
  
  RETURN QUERY SELECT COUNT(*)::BIGINT FROM public.pdf_generation_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ════════════════════════════════════════════════════════════════

-- Update pdf_templates.updated_at on modification
CREATE OR REPLACE FUNCTION update_pdf_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pdf_templates_updated_at
  BEFORE UPDATE ON public.pdf_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_pdf_templates_updated_at();

-- Update template usage stats on PDF generation
CREATE OR REPLACE FUNCTION update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pdf_template_usage (template_id, last_used)
  VALUES (NEW.template_id, NOW())
  ON CONFLICT (template_id) DO UPDATE
  SET
    successful_generations = CASE WHEN NEW.status = 'success' THEN pdf_template_usage.successful_generations + 1 ELSE pdf_template_usage.successful_generations END,
    failed_generations = CASE WHEN NEW.status = 'error' THEN pdf_template_usage.failed_generations + 1 ELSE pdf_template_usage.failed_generations END,
    lead_count = pdf_template_usage.lead_count + CASE WHEN NOT EXISTS(SELECT 1 FROM public.pdf_generation_logs WHERE template_id = NEW.template_id AND lead_id = NEW.lead_id AND id != NEW.id) THEN 1 ELSE 0 END,
    updated_at = NOW(),
    last_used = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_template_usage
  AFTER INSERT ON public.pdf_generation_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_template_usage();
