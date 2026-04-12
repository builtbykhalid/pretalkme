-- Migration: Create Services Table
-- Date: 2026-02-26

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_type TEXT CHECK (price_type IN ('free', 'fixed', 'quote')) DEFAULT 'fixed',
    price_amount NUMERIC,
    duration_minutes INTEGER,
    image_url TEXT,
    -- Visibility options
    is_active BOOLEAN DEFAULT true,
    show_on_public_profile BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their own services" ON public.services;
CREATE POLICY "Users can manage their own services"
  ON public.services FOR ALL
  USING (auth.uid() = consultant_id);

DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

-- Add service_id to leads
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.leads'::regclass AND attname = 'service_id') THEN
        ALTER TABLE public.leads ADD COLUMN service_id UUID REFERENCES public.services(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add thank_you_services to forms
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.forms'::regclass AND attname = 'thank_you_services') THEN
        ALTER TABLE public.forms ADD COLUMN thank_you_services UUID[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.forms'::regclass AND attname = 'show_services_on_thank_you') THEN
        ALTER TABLE public.forms ADD COLUMN show_services_on_thank_you BOOLEAN DEFAULT false;
    END IF;
END $$;
