-- Migration: Fix profile creation and RLS policies
-- Date: 2026-02-04

-- 1. Create profile for user pretalkme@gmail.com if not exists
INSERT INTO public.profiles (id, email, role, account_status, created_at)
SELECT 
  'de9b29d7-ddc2-4aa1-8108-ab7253847665',
  'pretalkme@gmail.com',
  'consultant',
  'active',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = 'de9b29d7-ddc2-4aa1-8108-ab7253847665'
);

-- 2. Fix RLS policies - ensure users can only see their OWN data

-- Drop existing SELECT policy if exists
DROP POLICY IF EXISTS "Users can select their own forms" ON public.forms;

-- Create strict SELECT policy
CREATE POLICY "Users can select their own forms"
  ON public.forms FOR SELECT
  USING (auth.uid() = user_id);

-- Ensure admin policy doesn't override user isolation for regular users
DROP POLICY IF EXISTS "Admins have full access to forms" ON public.forms;

CREATE POLICY "Admins have full access to forms"
  ON public.forms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, account_status, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'consultant',
    'active',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
