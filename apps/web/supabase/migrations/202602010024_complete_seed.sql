-- Migration: Complete seed setup for dev user
-- Date: 2026-02-08
-- This migration adds missing columns, creates dev user profile, and seeds test data

-- ============================================================================
-- STEP 1: Add missing columns to leads table
-- ============================================================================
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS user_id uuid,
ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- STEP 2: Disable RLS temporarily for data insertion
-- ============================================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create dev user profile
-- ============================================================================
INSERT INTO public.profiles (id, role, full_name, email, created_at)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'consultant', 'Dev User', 'dev@localhost', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Create test forms for dev user
-- ============================================================================
INSERT INTO public.forms (user_id, title, status, slug, form_structure, ai_config, design_config, views_count, leads_count, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Form 1', 'published', 'test-form-1', '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 0, now(), now()),
  ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Form 2', 'published', 'test-form-2', '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 0, now(), now()),
  ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Form 3', 'published', 'test-form-3', '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 0, now(), now())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Create test leads for dev user
-- ============================================================================
INSERT INTO public.leads (user_id, form_id, respondent_info, score, status, created_at, updated_at)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  (SELECT id FROM public.forms WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid LIMIT 1),
  jsonb_build_object('name', names.name, 'email', names.email, 'company', names.company),
  50 + (random() * 50)::int,
  'new',
  now() - ((row_number() OVER ()) || ' hours')::interval,
  now()
FROM (VALUES 
  ('Alice Johnson'::text, 'alice@test.com'::text, 'Tech Corp'::text),
  ('Bob Smith', 'bob@test.com', 'Startup Inc'),
  ('Carol Davis', 'carol@test.com', 'Digital Agency'),
  ('David Brown', 'david@test.com', 'Cloud Solutions'),
  ('Eve Wilson', 'eve@test.com', 'Web Services')
) AS names(name, email, company)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Re-enable RLS
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
