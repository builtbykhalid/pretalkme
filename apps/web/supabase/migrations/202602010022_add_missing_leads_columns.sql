-- Migration: Add missing columns to leads table
-- Date: 2026-02-08
-- Purpose: Add user_id, score, status, created_at, updated_at columns to leads table

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS user_id uuid,
ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add foreign key constraint for user_id if it doesn't exist
ALTER TABLE public.leads
ADD CONSTRAINT fk_leads_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
