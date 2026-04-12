-- Migration: Fix profile RLS and create missing profile
-- Date: 2026-02-04

-- 1. Add INSERT policy for profiles (users can create their own profile)
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Insert the missing profile using a SECURITY DEFINER function (bypasses RLS)
CREATE OR REPLACE FUNCTION create_profile_for_user(
  p_user_id uuid,
  p_email text,
  p_role text DEFAULT 'consultant'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, account_status, created_at)
  VALUES (p_user_id, p_email, p_role, 'active', NOW())
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the profile for pretalkme@gmail.com
SELECT create_profile_for_user(
  'de9b29d7-ddc2-4aa1-8108-ab7253847665'::uuid,
  'pretalkme@gmail.com',
  'consultant'
);

-- 4. Verify the profile was created
DO $$
DECLARE
  profile_count integer;
BEGIN
  SELECT COUNT(*) INTO profile_count 
  FROM public.profiles 
  WHERE id = 'de9b29d7-ddc2-4aa1-8108-ab7253847665';
  
  IF profile_count = 0 THEN
    RAISE EXCEPTION 'Profile was not created!';
  END IF;
  
  RAISE NOTICE 'Profile created successfully. Count: %', profile_count;
END;
$$;
