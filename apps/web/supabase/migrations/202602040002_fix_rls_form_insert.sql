-- Migration: Fix RLS policies for form insertion
-- The "Users can manage their own forms" policy uses USING only (for SELECT)
-- For INSERT operations on forms, we need explicit WITH CHECK policies
-- Date: 2026-02-04

-- First, drop conflicting policies
DROP POLICY IF EXISTS "Users can manage their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can insert their own forms" ON public.forms;

-- Recreate with separate policies for different operations
-- SELECT: Users can see their own forms
CREATE POLICY "Users can select their own forms"
  ON public.forms FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create new forms they own
CREATE POLICY "Users can insert their own forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own forms
CREATE POLICY "Users can update their own forms"
  ON public.forms FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own forms
CREATE POLICY "Users can delete their own forms"
  ON public.forms FOR DELETE
  USING (auth.uid() = user_id);

-- ADMIN access remains unchanged
CREATE POLICY "Admins have full access to forms"
  ON public.forms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
