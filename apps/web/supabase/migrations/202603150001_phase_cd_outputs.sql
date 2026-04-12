-- Phase C/D workflow compatibility
-- Adds proposal output columns and ensures deals upsert by lead_id works safely.

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS proposals_json JSONB,
ADD COLUMN IF NOT EXISTS proposal_generation_status TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS proposal_generated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.leads.proposals_json IS 'Structured pricing proposals generated in Phase C workflow';
COMMENT ON COLUMN public.leads.proposal_generation_status IS 'Phase C generation state: idle|running|completed|failed';
COMMENT ON COLUMN public.leads.proposal_generated_at IS 'Timestamp of last successful proposal generation';

CREATE INDEX IF NOT EXISTS idx_leads_proposal_generation_status ON public.leads(proposal_generation_status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_deals_lead_id_unique ON public.deals(lead_id);
