-- Migration: Enable authenticated users to insert forms
-- This policy allows any authenticated user to create forms (they own them via user_id)
-- Date: 2026-02-04

-- Drop old policies that might be blocking
DROP POLICY IF EXISTS "Authenticated users can insert their own forms" ON public.forms;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;

-- The existing "Users can manage their own forms" policy uses USING for ALL operations
-- For INSERT, we need WITH CHECK - let's add explicit INSERT policies

-- Add an explicit INSERT policy for authenticated users on forms table
CREATE POLICY "Users can insert their own forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add an explicit INSERT policy for authenticated users on profiles table
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

