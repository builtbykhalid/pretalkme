-- Migration: Add consultant fields to forms table for n8n workflow compatibility
-- Date: 2026-02-02
-- Purpose: Add fields required by the n8n Analyste workflow

-- Add consultant-related columns to forms table
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS consultant_email text,
ADD COLUMN IF NOT EXISTS consultant_name text, 
ADD COLUMN IF NOT EXISTS consultant_role text DEFAULT 'consultant expert',
ADD COLUMN IF NOT EXISTS domain text;

-- Create index for consultant_email lookups
CREATE INDEX IF NOT EXISTS idx_forms_consultant_email ON forms(consultant_email);

-- Update existing forms with default consultant info (optional - for demo data)
UPDATE forms 
SET 
  consultant_email = 'admin@pretalk.me',
  consultant_name = 'Équipe Pretalk',
  consultant_role = 'consultant expert en marketing digital',
  domain = 'pretalk.me'
WHERE consultant_email IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN forms.consultant_email IS 'Email du consultant propriétaire du formulaire (pour notifications n8n)';
COMMENT ON COLUMN forms.consultant_name IS 'Nom du consultant (pour personnalisation des emails)';
COMMENT ON COLUMN forms.consultant_role IS 'Rôle/expertise du consultant (utilisé dans les prompts IA)';
COMMENT ON COLUMN forms.domain IS 'Domaine personnalisé du consultant (optionnel)';