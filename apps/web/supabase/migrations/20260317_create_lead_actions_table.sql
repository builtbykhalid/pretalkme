-- Supabase Migration: Create lead_actions audit trail table
-- This table tracks all user actions on leads for compliance, debugging, and UX optimization

CREATE TABLE IF NOT EXISTS public.lead_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'qualified', 
    'rejected', 
    'reviewed', 
    'sent',
    'proposal_viewed',
    'audit_regenerated',
    'contacted',
    'archived'
  )),
  action_reason TEXT,
  triggered_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Performance indexes
  CONSTRAINT lead_actions_lead_id_fkey UNIQUE (lead_id, id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_lead_actions_lead_id 
  ON public.lead_actions(lead_id);

CREATE INDEX IF NOT EXISTS idx_lead_actions_action_type 
  ON public.lead_actions(action_type);

CREATE INDEX IF NOT EXISTS idx_lead_actions_created_at 
  ON public.lead_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_actions_user_id 
  ON public.lead_actions(triggered_by);

-- Row Level Security (RLS)
ALTER TABLE public.lead_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view lead actions for their own leads
CREATE POLICY "users_can_view_their_lead_actions"
  ON public.lead_actions
  FOR SELECT
  USING (
    lead_id IN (
      SELECT id FROM public.leads WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert lead actions for their own leads  
CREATE POLICY "users_can_insert_lead_actions"
  ON public.lead_actions
  FOR INSERT
  WITH CHECK (
    lead_id IN (
      SELECT id FROM public.leads WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own lead actions (for logging corrections)
CREATE POLICY "users_can_update_lead_actions"
  ON public.lead_actions
  FOR UPDATE
  USING (
    lead_id IN (
      SELECT id FROM public.leads WHERE user_id = auth.uid()
    )
  );

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_lead_actions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_actions_timestamp
  BEFORE UPDATE ON public.lead_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_actions_timestamp();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.lead_actions TO authenticated;
GRANT USAGE ON SEQUENCE public.lead_actions_id_seq TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.lead_actions IS 'Audit trail for all user actions performed on leads. Used for compliance, debugging, and UX analytics.';
COMMENT ON COLUMN public.lead_actions.action_type IS 'Type of action performed: qualified, rejected, reviewed, sent, proposal_viewed, audit_regenerated, contacted, archived';
COMMENT ON COLUMN public.lead_actions.action_reason IS 'Optional reason or context for the action (e.g., rejection reason)';
COMMENT ON COLUMN public.lead_actions.metadata IS 'JSON metadata containing workflow response, timing, errors, or any additional context';
