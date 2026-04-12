-- Seed development data for testing
-- Temporarily disable RLS to insert data
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- 1. Ensure dev user profile exists
INSERT INTO public.profiles (id, role, first_name, last_name, email, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'consultant',
  'Dev',
  'User',
  'dev@localhost',
  now()
)
ON CONFLICT (id) DO UPDATE SET 
  role = 'consultant';

-- 2. Create test forms for dev user
INSERT INTO public.forms (
  id,
  user_id, 
  title, 
  status, 
  slug, 
  form_structure, 
  ai_config, 
  design_config, 
  views_count, 
  leads_count,
  created_at,
  updated_at
)
VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000'::uuid, 'Test Form 1', 'published', 'test-form-1', '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 0, now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000'::uuid, 'Test Form 2', 'published', 'test-form-2', '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 0, now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000'::uuid, 'Test Form 3', 'published', 'test-form-3', '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, 0, 0, now(), now())
ON CONFLICT DO NOTHING;

-- 3. Create test leads for dev user
WITH forms_for_dev AS (
  SELECT id FROM public.forms 
  WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
  LIMIT 1
)
INSERT INTO public.leads (
  id,
  user_id,
  form_id,
  respondent_info,
  score,
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  (SELECT id FROM forms_for_dev),
  jsonb_build_object(
    'name', names.name,
    'email', names.email,
    'company', names.company
  ),
  50 + (random() * 50)::int,
  'new',
  now() - ((row_number() OVER ()) || ' hours')::interval,
  now()
FROM (
  VALUES
    ('Alice Johnson'::text, 'alice@test.com'::text, 'Tech Corp'::text),
    ('Bob Smith', 'bob@test.com', 'Startup Inc'),
    ('Carol Davis', 'carol@test.com', 'Digital Agency'),
    ('David Brown', 'david@test.com', 'Cloud Solutions'),
    ('Eve Wilson', 'eve@test.com', 'Web Services')
) AS names(name, email, company)
ON CONFLICT DO NOTHING;

-- 4. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. Verify
SELECT 
  (SELECT COUNT(*) FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000000'::uuid) as profiles_count,
  (SELECT COUNT(*) FROM public.forms WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid) as forms_count,
  (SELECT COUNT(*) FROM public.leads WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid) as leads_count;
