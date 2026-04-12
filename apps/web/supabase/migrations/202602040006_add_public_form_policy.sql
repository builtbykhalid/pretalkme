-- Allow public read access to published forms
CREATE POLICY "Public select published forms"
  ON public.forms FOR SELECT
  USING (status = 'published');