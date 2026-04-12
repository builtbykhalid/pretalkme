-- Migration: Post-Update Enhancements for Phases D, E, and F
-- Purpose: Add support for Contract Summary, Kickoff Form Slugs, and Billing Status.

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS contract_summary TEXT, -- Dedicated column for the AI-generated contract focus
ADD COLUMN IF NOT EXISTS kickoff_form_slug TEXT, -- Link to the generated kickoff/onboarding form
ADD COLUMN IF NOT EXISTS kickoff_form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL;

ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'pending', -- 'pending' | 'invoiced' | 'paid' | 'overdue'
ADD COLUMN IF NOT EXISTS invoice_url TEXT, -- Link to the generated invoice PDF
ADD COLUMN IF NOT EXISTS receipt_url TEXT; -- Link to the payment receipt

COMMENT ON COLUMN public.leads.contract_summary IS 'AI-generated summary of clauses and commercial promises for Phase D';
COMMENT ON COLUMN public.leads.kickoff_form_slug IS 'Slug of the specialized form generated for Phase E onboarding';
COMMENT ON COLUMN public.deals.billing_status IS 'Financial tracking status for Phase F';
