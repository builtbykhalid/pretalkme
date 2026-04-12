-- Migration: Add scheduled_emails table for follow-up/relance system
-- Allows consultants to auto-schedule follow-up emails after audit/proposal delivery

CREATE TABLE IF NOT EXISTS public.scheduled_emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  recipient_email text NOT NULL,
  recipient_name text,
  consultant_name text,
  consultant_email text,
  locale text DEFAULT 'fr',
  template_params jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status_scheduled
  ON public.scheduled_emails(status, scheduled_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_lead_id
  ON public.scheduled_emails(lead_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_user_id
  ON public.scheduled_emails(user_id);

-- RLS
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY scheduled_emails_own
  ON public.scheduled_emails
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY scheduled_emails_service_role
  ON public.scheduled_emails
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_emails TO authenticated;
GRANT ALL ON public.scheduled_emails TO service_role;

COMMENT ON TABLE public.scheduled_emails IS
  'Stores scheduled follow-up emails (relance) for leads after audit/proposal delivery';
