-- Migration: Add automations_config to profiles
-- Date: 2026-04-03

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS automations_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.automations_config IS
  'Règles automatiques : kickoff_mode, auto_step_audit, auto_step_rdv, auto_step_proposal, auto_step_won';
