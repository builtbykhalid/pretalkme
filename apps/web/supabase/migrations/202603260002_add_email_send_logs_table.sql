-- Migration: Add email_send_logs table for Brevo email tracking
-- Purpose: Track all transactional emails sent via Brevo service for audit trail and debugging
-- Date: 2026-03-26

-- ============================================================================
-- Create email_send_logs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_send_logs (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  message_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'blocked')),
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_email_send_logs_lead_id
  ON public.email_send_logs(lead_id);

CREATE INDEX IF NOT EXISTS idx_email_send_logs_sent_at
  ON public.email_send_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_send_logs_event_type_status
  ON public.email_send_logs(event_type, status);

CREATE INDEX IF NOT EXISTS idx_email_send_logs_message_id
  ON public.email_send_logs(message_id);

-- ============================================================================
-- Enable RLS (Row-Level Security)
-- ============================================================================

ALTER TABLE public.email_send_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view email logs for their own leads
CREATE POLICY email_send_logs_own_lead
  ON public.email_send_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = email_send_logs.lead_id
      AND leads.user_id = auth.uid()
    )
    OR auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'
  );

-- Policy: System can insert logs
CREATE POLICY email_send_logs_system_insert
  ON public.email_send_logs
  FOR INSERT
  WITH CHECK (true);  -- Restricted via API endpoint authentication

-- ============================================================================
-- Utility function: Get email statistics
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_email_stats(
  p_lead_id UUID DEFAULT NULL,
  p_since TIMESTAMP DEFAULT NULL
)
RETURNS TABLE(
  event_type TEXT,
  total_sent BIGINT,
  total_failed BIGINT,
  failed_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.event_type,
    COUNT(*) FILTER (WHERE e.status = 'sent') as total_sent,
    COUNT(*) FILTER (WHERE e.status != 'sent') as total_failed,
    ROUND(
      COUNT(*) FILTER (WHERE e.status != 'sent')::NUMERIC / 
      NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
      2
    ) as failed_percentage
  FROM public.email_send_logs e
  WHERE
    (p_lead_id IS NULL OR e.lead_id = p_lead_id)
    AND (p_since IS NULL OR e.sent_at >= p_since)
  GROUP BY e.event_type
  ORDER BY total_sent DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Utility function: Get recent failures for debugging
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_email_failures(p_limit INT DEFAULT 50)
RETURNS TABLE(
  message_id TEXT,
  lead_id UUID,
  event_type TEXT,
  recipient_email TEXT,
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.message_id,
    e.lead_id,
    e.event_type,
    e.recipient_email,
    e.error,
    e.sent_at
  FROM public.email_send_logs e
  WHERE e.status != 'sent'
  ORDER BY e.sent_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.email_send_logs IS
  'Audit trail for all transactional emails sent via Brevo service. Used for debugging, compliance, and analytics.';

COMMENT ON COLUMN public.email_send_logs.message_id IS
  'Brevo message ID from API response. Can be used to query Brevo for delivery status.';

COMMENT ON COLUMN public.email_send_logs.status IS
  'Email delivery status: sent (queued in Brevo), failed (API error), bounced (returned by ISP), blocked (spam score).';

COMMENT ON COLUMN public.email_send_logs.error IS
  'Error message if status is not "sent". Contains API error or validation error.';
