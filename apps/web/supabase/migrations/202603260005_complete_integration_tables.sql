-- Final Integration Tables & Views
-- Document sending logs, blacklist, and unified analytics

-- ════════════════════════════════════════════════════════════════
-- DOCUMENT SENDING LOGS (for complete workflow audit)
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.document_sending_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('devis', 'audit', 'contrat', 'rapport')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  pdf_url TEXT,
  email_id TEXT,
  template_used UUID REFERENCES public.pdf_templates(id),
  validation_score NUMERIC,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_sending_lead ON public.document_sending_logs(lead_id);
CREATE INDEX idx_document_sending_status ON public.document_sending_logs(status);
CREATE INDEX idx_document_sending_date ON public.document_sending_logs(created_at DESC);
CREATE INDEX idx_document_sending_type ON public.document_sending_logs(document_type);

-- ════════════════════════════════════════════════════════════════
-- EMAIL BLACKLIST
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.email_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_domain_block BOOLEAN DEFAULT false,
  reason TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID,
  active BOOLEAN DEFAULT true
);

CREATE INDEX idx_email_blacklist_email ON public.email_blacklist(email);
CREATE INDEX idx_email_blacklist_active ON public.email_blacklist(active);

-- ════════════════════════════════════════════════════════════════
-- UNIFIED ANALYTICS VIEWS
-- ════════════════════════════════════════════════════════════════

-- View: Lead Document Generation Summary
CREATE OR REPLACE VIEW public.v_lead_document_summary AS
SELECT
  l.id as lead_id,
  l.full_name,
  l.email,
  l.status,
  COUNT(DISTINCT dsl.id) as total_documents_sent,
  COUNT(DISTINCT CASE WHEN dsl.status = 'success' THEN dsl.id END) as successful_sends,
  COUNT(DISTINCT CASE WHEN dsl.status = 'error' THEN dsl.id END) as failed_sends,
  COUNT(DISTINCT CASE WHEN dsl.document_type = 'devis' THEN dsl.id END) as devis_sent,
  COUNT(DISTINCT CASE WHEN dsl.document_type = 'audit' THEN dsl.id END) as audits_sent,
  COUNT(DISTINCT CASE WHEN dsl.document_type = 'contrat' THEN dsl.id END) as contracts_sent,
  MAX(dsl.created_at) as last_document_sent,
  AVG(COALESCE(dsl.validation_score, 80)) as avg_email_score,
  AVG(COALESCE(dsl.duration_ms, 0)) as avg_send_duration_ms
FROM public.leads l
LEFT JOIN public.document_sending_logs dsl ON l.id = dsl.lead_id
GROUP BY l.id, l.full_name, l.email, l.status;

-- View: Email Performance Metrics
CREATE OR REPLACE VIEW public.v_email_performance AS
SELECT
  DATE_TRUNC('day', dsl.created_at) as send_date,
  dsl.document_type,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN dsl.status = 'success' THEN 1 END) as successful,
  COUNT(CASE WHEN dsl.status = 'error' THEN 1 END) as failed,
  ROUND(100.0 * COUNT(CASE WHEN dsl.status = 'success' THEN 1 END) / COUNT(*), 2) as success_rate,
  ROUND(AVG(COALESCE(dsl.duration_ms, 0))::NUMERIC, 2) as avg_duration_ms,
  ROUND(AVG(COALESCE(dsl.validation_score, 80))::NUMERIC, 2) as avg_validation_score
FROM public.document_sending_logs dsl
GROUP BY DATE_TRUNC('day', dsl.created_at), dsl.document_type;

-- View: Lead Conversion Pipeline
CREATE OR REPLACE VIEW public.v_conversion_pipeline AS
SELECT
  l.id as lead_id,
  l.full_name,
  l.status,
  lgs.overall_status as generation_status,
  COALESCE(dsl_devis.sent_count, 0) as devis_sent,
  COALESCE(dsl_contrat.sent_count, 0) as contracts_sent,
  CASE
    WHEN l.status = 'won' THEN 'converted'
    WHEN l.status = 'lost' THEN 'lost'
    WHEN l.status = 'negotiating' AND COALESCE(dsl_contrat.sent_count, 0) > 0 THEN 'final_stage'
    WHEN l.status = 'proposal_sent' AND COALESCE(dsl_devis.sent_count, 0) > 0 THEN 'presentation_stage'
    WHEN l.status = 'qualified' THEN 'qualification_stage'
    ELSE 'discovery_stage'
  END as pipeline_stage,
  l.updated_at
FROM public.leads l
LEFT JOIN public.v_lead_generation_status lgs ON l.id = lgs.lead_id
LEFT JOIN (
  SELECT lead_id, COUNT(*) as sent_count
  FROM public.document_sending_logs
  WHERE document_type = 'devis' AND status = 'success'
  GROUP BY lead_id
) dsl_devis ON l.id = dsl_devis.lead_id
LEFT JOIN (
  SELECT lead_id, COUNT(*) as sent_count
  FROM public.document_sending_logs
  WHERE document_type = 'contrat' AND status = 'success'
  GROUP BY lead_id
) dsl_contrat ON l.id = dsl_contrat.lead_id;

-- ════════════════════════════════════════════════════════════════
-- UTILITY FUNCTIONS
-- ════════════════════════════════════════════════════════════════

-- Get email failure reasons for a lead
CREATE OR REPLACE FUNCTION get_email_failures(lead_uuid UUID)
RETURNS TABLE (
  failure_count BIGINT,
  recent_errors TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as failure_count,
    ARRAY_AGG(DISTINCT error_message ORDER BY error_message)::TEXT[] as recent_errors
  FROM public.document_sending_logs
  WHERE lead_id = lead_uuid AND status = 'error' AND created_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.document_sending_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their lead document logs" ON public.document_sending_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT assigned_to FROM public.leads WHERE id = lead_id)
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can manage email blacklist" ON public.email_blacklist
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ════════════════════════════════════════════════════════════════
-- SCHEDULED MAINTENANCE
-- ════════════════════════════════════════════════════════════════

-- Cleanup old logs (90 days)
CREATE OR REPLACE FUNCTION cleanup_old_sending_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.document_sending_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
