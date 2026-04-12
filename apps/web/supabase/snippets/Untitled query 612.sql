-- Enable public form access

-- Allow SELECT on forms table
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "public_form_access" ON public.forms;
DROP POLICY IF EXISTS "public_lead_creation" ON public.leads;

-- Create permissive policies for public access
CREATE POLICY "allow_public_form_read" ON public.forms
  FOR SELECT USING (true);

CREATE POLICY "allow_public_lead_insert" ON public.leads
  FOR INSERT WITH CHECK (true);