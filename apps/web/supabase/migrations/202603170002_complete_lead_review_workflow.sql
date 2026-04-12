-- Migration: Complete Lead Review Cycle (Phases A-F)
-- Date: 2026-03-17
-- Purpose: Ensure all columns for Audit, Proposals, Contract, Kickoff and Billing are present.

-- 1. EXTENSION DE LA TABLE LEADS (Phases A, C, D, E)
ALTER TABLE public.leads 
-- Phase A: Audit & Versioning
ADD COLUMN IF NOT EXISTS ai_analysis_json JSONB, -- Stocke l'audit structuré (blocks, charts, notes)
ADD COLUMN IF NOT EXISTS ai_generation_history JSONB DEFAULT '[]'::jsonb, -- Versions précédentes
ADD COLUMN IF NOT EXISTS pdf_settings JSONB DEFAULT '{
  "cover_title": "Audit Stratégique",
  "cover_subtitle": "Préparé exclusivement pour le client",
  "closing_cta": "Prêt à accélérer ? Contactez-nous."
}'::jsonb,

-- Phase C: Offres / Proposals
ADD COLUMN IF NOT EXISTS proposals_json JSONB, -- Stocke les 3 options tarifaires générées par l'IA
ADD COLUMN IF NOT EXISTS proposal_generation_status TEXT DEFAULT 'idle', -- idle|running|completed|failed
ADD COLUMN IF NOT EXISTS proposal_generated_at TIMESTAMPTZ,

-- Phase D/E: Contrat & Kickoff
ADD COLUMN IF NOT EXISTS contract_summary TEXT, -- Résumé des clauses juridiques
ADD COLUMN IF NOT EXISTS kickoff_form_slug TEXT, -- Lien direct vers le formulaire onboarding
ADD COLUMN IF NOT EXISTS kickoff_form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL;

-- 2. EXTENSION DE LA TABLE DEALS (Phase F - FINANCE)
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'pending', -- 'pending' | 'invoiced' | 'paid' | 'overdue'
ADD COLUMN IF NOT EXISTS invoice_url TEXT, -- PDF de la facture
ADD COLUMN IF NOT EXISTS receipt_url TEXT; -- Reçu de paiement

-- 3. PRÉFÉRENCES D'AUTOMATISATION (PROFILES)
-- On vérifie/ajoute les champs de préférences email pour les automatisations Phase C/D
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email_automation_preferences') THEN
        ALTER TABLE public.profiles ADD COLUMN email_automation_preferences JSONB DEFAULT '{
          "audit_template_type": "default", 
          "audit_custom_template": "",
          "proposal_template_type": "default",
          "proposal_custom_template": ""
        }'::jsonb;
    END IF;
END $$;

-- 4. INDEXATION POUR LES PERFORMANCES ET L'UNICITÉ
-- Important pour que l'upsert des deals fonctionne correctement par lead_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_deals_lead_id_unique ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_kickoff_slug ON public.leads(kickoff_form_slug);
CREATE INDEX IF NOT EXISTS idx_leads_proposal_gen_status ON public.leads(proposal_generation_status);

-- COMMENTAIRES POUR LA DOCUMENTATION SUPABASE
COMMENT ON COLUMN public.leads.ai_analysis_json IS 'Données structurées pour l''audit et les graphiques';
COMMENT ON COLUMN public.leads.proposals_json IS 'Options tarifaires IA de la Phase C';
COMMENT ON COLUMN public.leads.contract_summary IS 'Clauses contractuelles générées par IA';
COMMENT ON COLUMN public.leads.kickoff_form_slug IS 'Lien vers le formulaire de lancement généré en Phase E';
COMMENT ON COLUMN public.deals.billing_status IS 'État de facturation pour le suivi financier';
