-- Seed: Create the Dev User Profile
-- Date: 2026-02-01
-- This ensures the mock user exists in the profiles table to satisfy foreign key constraints.

INSERT INTO public.profiles (id, email, full_name, role, account_status)
VALUES 
(
  '00000000-0000-0000-0000-000000000000', 
  'dev@pretalk.me', 
  'Dev User', 
  'admin', 
  'active'
)
ON CONFLICT (id) DO NOTHING;
