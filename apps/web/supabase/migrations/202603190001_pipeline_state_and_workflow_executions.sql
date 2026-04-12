-- Migration: Lead Review Pipeline State & Workflow Executions
-- Date: 2026-03-19
-- Purpose: Add explicit pipeline state tracking and workflow telemetry.
-- Covers: Tâches 1.1, 1.2, 1.3, 1.4, 1.5 from todo.md

-- ============================================================
-- TÂCHE 1.1 — Colonne pipeline_state dans la table leads
-- ============================================================
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS pipeline_state JSONB DEFAULT '{
  "current_phase": "briefing",
  "phases": {
    "briefing":   { "status": "completed", "completed_at": null },
    "notes":      { "status": "locked" },
    "audit":      { "status": "locked" },
    "proposals":  { "status": "locked" },
    "contract":   { "status": "locked" },
    "kickoff":    { "status": "locked" },
    "finance":    { "status": "locked" }
  }
}'::jsonb;

COMMENT ON COLUMN public.leads.pipeline_state IS
'Source de vérité unique pour l''état du pipeline. Statuts possibles : locked | pending | in_progress | completed | failed';

-- ============================================================
-- TÂCHE 1.2 — Créer la table workflow_executions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN (
    'briefing','notes','audit','proposals','contract','kickoff','finance'
  )),
  workflow_name TEXT NOT NULL,
  webhook_identifier TEXT,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN (
    'started','in_progress','completed','failed'
  )),
  step_label TEXT,
  progress_steps JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_lead_id ON public.workflow_executions(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON public.workflow_executions(status);

ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead executions"
  ON public.workflow_executions FOR SELECT
  USING (
    lead_id IN (SELECT id FROM public.leads WHERE user_id = auth.uid())
  );

COMMENT ON COLUMN public.workflow_executions.progress_steps IS
'Array JSON des étapes internes ex: [{"label":"Rendu PDF","status":"completed"},{"label":"Upload","status":"in_progress"}]';

-- ============================================================
-- TÂCHE 1.3 — Créer la table lead_generation_states
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_generation_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  is_generating BOOLEAN DEFAULT FALSE,
  generation_started_at TIMESTAMPTZ,
  generation_completed_at TIMESTAMPTZ,
  last_generated_at TIMESTAMPTZ,
  generation_status TEXT DEFAULT 'idle' CHECK (generation_status IN (
    'idle','generating','success','failed'
  )),
  execution_id UUID REFERENCES public.workflow_executions(id),
  UNIQUE(lead_id, phase)
);

ALTER TABLE public.lead_generation_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own generation states"
  ON public.lead_generation_states FOR ALL
  USING (
    lead_id IN (SELECT id FROM public.leads WHERE user_id = auth.uid())
  );

-- ============================================================
-- TÂCHE 1.4 — Préparer la Phase F Finance (colonnes dans leads)
-- ============================================================
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS invoice_url TEXT,
ADD COLUMN IF NOT EXISTS invoice_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invoice_paid_at TIMESTAMPTZ;

-- Add check constraint separately so IF NOT EXISTS works for the column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_billing_status_check'
  ) THEN
    ALTER TABLE public.leads
    ADD CONSTRAINT leads_billing_status_check
    CHECK (billing_status IN ('pending','invoiced','paid','overdue'));
  END IF;
END $$;

COMMENT ON COLUMN public.leads.billing_status IS
'Statut de facturation Phase F. pending → invoiced → paid';

-- ============================================================
-- TÂCHE 1.5 — Fonction utilitaire update_lead_phase_status
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_lead_phase_status(
  p_lead_id UUID,
  p_phase TEXT,
  p_status TEXT,
  p_set_current BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.leads
  SET pipeline_state = jsonb_set(
    jsonb_set(
      pipeline_state,
      ARRAY['phases', p_phase, 'status'],
      to_jsonb(p_status)
    ),
    ARRAY['phases', p_phase,
      CASE WHEN p_status = 'completed' THEN 'completed_at'
           WHEN p_status = 'in_progress' THEN 'started_at'
           ELSE 'updated_at' END
    ],
    to_jsonb(NOW()::TEXT)
  )
  WHERE id = p_lead_id;

  IF p_set_current THEN
    UPDATE public.leads
    SET pipeline_state = jsonb_set(
      pipeline_state,
      '{current_phase}',
      to_jsonb(p_phase)
    )
    WHERE id = p_lead_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
