-- Migration: Enhance Services Table
-- Date: 2026-02-28

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS cta_label TEXT,
ADD COLUMN IF NOT EXISTS cta_url TEXT;

-- Update profiles table or use page_config JSONB (recommended to use page_config)
-- No changes needed to profiles table if we use page_config JSONB.
