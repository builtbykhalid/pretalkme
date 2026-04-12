-- Migration: LeadReview columns + realtime for kickoff form slug
-- Date: 2026-03-19
-- Purpose: Add columns and realtime for direct n8n webhook calls (no edge function)

-- Add kickoff_form_slug column for Phase E
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS kickoff_form_slug TEXT;

COMMENT ON COLUMN public.leads.kickoff_form_slug IS 'Slug of generated kickoff form (Phase E)';

CREATE INDEX IF NOT EXISTS idx_leads_kickoff_form_slug ON public.leads(kickoff_form_slug);

-- Optional hardening: if lead_generation_states exists, ensure on_conflict(lead_id, phase) works.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'lead_generation_states'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_generation_states_lead_phase_unique
      ON public.lead_generation_states (lead_id, phase);
  END IF;
END $$;

-- Ensure realtime publication includes leads table for instant updates
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;
