-- Phase 2-3 Fixes: Core Database & Status Management
-- FIX #1: Status taxonomy unification
-- FIX #8: Dual status sync RPC
-- FIX #11: Triple generation status

-- ════════════════════════════════════════════════════════════════
-- FIX #1: Unify status taxonomy
-- ════════════════════════════════════════════════════════════════

-- Ensure leads table has standardized status values
ALTER TABLE public.leads ADD CONSTRAINT check_status_valid CHECK (
  status IN (
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'negotiating',
    'won',
    'lost',
    'archived'
  )
);

-- Create a status transition audit table
CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  metadata JSONB
);

CREATE INDEX idx_lead_status_history_lead ON public.lead_status_history(lead_id);
CREATE INDEX idx_lead_status_history_date ON public.lead_status_history(changed_at DESC);

-- ════════════════════════════════════════════════════════════════
-- FIX #8: Dual status sync RPC (leads.status + pipeline_state.state)
-- ════════════════════════════════════════════════════════════════

-- Synchronize both status fields when one changes
CREATE OR REPLACE FUNCTION sync_lead_status(
  p_lead_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
  lead_id UUID,
  status_before TEXT,
  status_after TEXT,
  pipeline_state_synced BOOLEAN,
  sync_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  DECLARE
    v_old_status TEXT;
    v_sync_success BOOLEAN := false;
  BEGIN
    -- Get current status
    SELECT status INTO v_old_status FROM public.leads WHERE id = p_lead_id;
    
    IF v_old_status IS NULL THEN
      RAISE EXCEPTION 'Lead % not found', p_lead_id;
    END IF;

    -- Update leads.status
    UPDATE public.leads
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_lead_id;

    -- Update pipeline_state.state to match
    UPDATE public.pipeline_state
    SET state = p_new_status, updated_at = NOW()
    WHERE lead_id = p_lead_id;

    GET DIAGNOSTICS v_sync_success = ROW_COUNT;

    -- Log status change
    INSERT INTO public.lead_status_history (
      lead_id, previous_status, new_status, changed_by, reason
    ) VALUES (
      p_lead_id, v_old_status, p_new_status, auth.uid(), p_reason
    );

    -- Return result
    RETURN QUERY SELECT
      p_lead_id,
      v_old_status,
      p_new_status,
      v_sync_success > 0,
      NOW();
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════
-- FIX #11: Triple generation status tracking
-- ════════════════════════════════════════════════════════════════

-- Enhance lead_generation_states to track all 3 generation types
ALTER TABLE public.lead_generation_states ADD COLUMN IF NOT EXISTS devis_status TEXT DEFAULT 'idle';
ALTER TABLE public.lead_generation_states ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT 'idle';
ALTER TABLE public.lead_generation_states ADD COLUMN IF NOT EXISTS contrat_status TEXT DEFAULT 'idle';

-- Create unified generation status view
CREATE OR REPLACE VIEW public.v_lead_generation_status AS
SELECT
  lgs.lead_id,
  lgs.devis_status,
  lgs.audit_status,
  lgs.contrat_status,
  CASE
    WHEN lgs.devis_status = 'generating' OR lgs.audit_status = 'generating' OR lgs.contrat_status = 'generating'
    THEN 'generating'
    WHEN lgs.devis_status = 'success' AND lgs.audit_status = 'success' AND lgs.contrat_status = 'success'
    THEN 'all_success'
    WHEN lgs.devis_status = 'failed' OR lgs.audit_status = 'failed' OR lgs.contrat_status = 'failed'
    THEN 'partial_failed'
    ELSE 'idle'
  END as overall_status,
  lgs.updated_at
FROM public.lead_generation_states lgs;

-- ════════════════════════════════════════════════════════════════
-- FIX #4: Realtime + Polling Consolidation
-- Update realtime subscriptions to use consistent channels
-- ════════════════════════════════════════════════════════════════

-- Create a unified channel for lead changes
DROP PUBLICATION IF EXISTS lead_changes CASCADE;
CREATE PUBLICATION lead_changes FOR TABLE 
  public.leads, 
  public.pipeline_state, 
  public.lead_generation_states;

-- Create a function to notify about lead changes
CREATE OR REPLACE FUNCTION notify_lead_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'lead_changes',
    json_build_object(
      'event', TG_OP,
      'table', TG_TABLE_NAME,
      'lead_id', COALESCE(NEW.lead_id, OLD.lead_id),
      'timestamp', NOW()
    )::TEXT
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_leads AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION notify_lead_changes();

CREATE OR REPLACE TRIGGER trg_notify_pipeline_state AFTER INSERT OR UPDATE OR DELETE ON public.pipeline_state
  FOR EACH ROW EXECUTE FUNCTION notify_lead_changes();

CREATE OR REPLACE TRIGGER trg_notify_generation_states AFTER INSERT OR UPDATE OR DELETE ON public.lead_generation_states
  FOR EACH ROW EXECUTE FUNCTION notify_lead_changes();

-- ════════════════════════════════════════════════════════════════
-- FIX #10: Deal creation rule (auto-create on 'won' status)
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_create_deal_on_won()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'won' AND OLD.status != 'won' THEN
    -- Create deal if not exists
    INSERT INTO public.deals (
      lead_id,
      deal_name,
      deal_value,
      deal_status,
      created_at
    )
    SELECT
      NEW.id,
      'Deal - ' || NEW.full_name,
      COALESCE(NEW.estimated_budget, 0),
      'closed_won',
      NOW()
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_auto_create_deal
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION auto_create_deal_on_won();

-- ════════════════════════════════════════════════════════════════
-- FIX #13: Pre-send validation schema
-- ════════════════════════════════════════════════════════════════

-- Create email validation log table
CREATE TABLE IF NOT EXISTS public.email_validation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  validation_result TEXT CHECK (validation_result IN ('valid', 'invalid', 'risky')),
  validation_checks JSONB,
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_validation_lead ON public.email_validation_log(lead_id);
CREATE INDEX idx_email_validation_result ON public.email_validation_log(validation_result);

-- Email validation function
CREATE OR REPLACE FUNCTION validate_email_before_send(p_email TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  validation_result TEXT,
  checks JSONB
) AS $$
DECLARE
  v_checks JSONB;
BEGIN
  v_checks := jsonb_build_object(
    'format_valid', p_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$',
    'length_valid', LENGTH(p_email) <= 254,
    'not_disposable', NOT (p_email ~ '@(tempmail|guerrillamail|10minutemail)\.'),
    'not_blacklisted', NOT EXISTS (SELECT 1 FROM public.email_blacklist WHERE email = p_email)
  );

  RETURN QUERY SELECT
    (v_checks ->> 'format_valid')::BOOLEAN AND
    (v_checks ->> 'length_valid')::BOOLEAN AND
    (v_checks ->> 'not_disposable')::BOOLEAN AND
    (v_checks ->> 'not_blacklisted')::BOOLEAN as is_valid,
    CASE
      WHEN (v_checks ->> 'format_valid')::BOOLEAN = false THEN 'invalid'
      WHEN (v_checks ->> 'not_disposable')::BOOLEAN = false THEN 'risky'
      WHEN (v_checks ->> 'not_blacklisted')::BOOLEAN = false THEN 'invalid'
      ELSE 'valid'
    END as validation_result,
    v_checks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════
-- FIX #9: Migration cleanup (remove duplicate kickoff_form_slug)
-- ════════════════════════════════════════════════════════════════

-- Drop duplicate column if exists
ALTER TABLE public.leads DROP COLUMN IF EXISTS kickoff_form_slug_duplicate;

-- Ensure single source of truth for kickoff form
CREATE UNIQUE INDEX idx_leads_kickoff_form_slug ON public.leads(kickoff_form_slug) WHERE kickoff_form_slug IS NOT NULL;

-- ════════════════════════════════════════════════════════════════
-- FIX #14: Email endpoint consolidation
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.email_endpoint_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL CHECK (action_type IN ('send_audit', 'send_proposal', 'send_contract', 'send_custom')),
  endpoint_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_email_endpoint_action ON public.email_endpoint_mapping(action_type) WHERE is_active = true;

-- ════════════════════════════════════════════════════════════════
-- RLS for Phase 2-3 tables
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_validation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_endpoint_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lead status history" ON public.lead_status_history
  FOR SELECT USING (
    auth.uid() IN (SELECT assigned_to FROM public.leads WHERE id = lead_id)
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can view email validation of their leads" ON public.email_validation_log
  FOR SELECT USING (
    auth.uid() IN (SELECT assigned_to FROM public.leads WHERE id = lead_id)
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can manage email endpoints" ON public.email_endpoint_mapping
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
