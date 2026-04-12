-- Migration: Fix public form access without authentication
-- Allow public access to forms table for reading

-- Enable RLS but add a public policy for reading forms
ALTER TABLE IF EXISTS public.forms ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on forms
DROP POLICY IF EXISTS "public_form_access" ON public.forms;

-- Create a public read policy that doesn't require authentication
CREATE POLICY "public_form_access" ON public.forms
  FOR SELECT
  USING (true);

-- Also create a policy for leads insertion without auth
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_lead_creation" ON public.leads;

CREATE POLICY "public_lead_creation" ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Enable RLS on the tables
ALTER TABLE IF EXISTS public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
