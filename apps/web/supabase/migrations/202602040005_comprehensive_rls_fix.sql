-- Migration: Comprehensive RLS fix for all tables
-- Date: 2026-02-04

-- First, check if the profile exists
DO $$
DECLARE
  profile_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = 'de9b29d7-ddc2-4aa1-8108-ab7253847665') INTO profile_exists;
  RAISE NOTICE 'Profile exists: %', profile_exists;
END;
$$;

-- Drop ALL existing policies to start fresh
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename || ';';
    END LOOP;
END $$;

-- ==============================================================================
-- PROFILES TABLE POLICIES
-- ==============================================================================
-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- FORMS TABLE POLICIES
-- ==============================================================================
-- Users can only read their own forms
CREATE POLICY "forms_select_own"
  ON public.forms FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert forms they own
CREATE POLICY "forms_insert_own"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own forms
CREATE POLICY "forms_update_own"
  ON public.forms FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own forms
CREATE POLICY "forms_delete_own"
  ON public.forms FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- LEADS TABLE POLICIES
-- ==============================================================================
-- Users can read leads from their own forms
CREATE POLICY "leads_select_own"
  ON public.leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = leads.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Public form submissions (anyone can insert leads)
CREATE POLICY "leads_insert_public"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Users can update leads from their own forms
CREATE POLICY "leads_update_own"
  ON public.leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = leads.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Users can delete leads from their own forms
CREATE POLICY "leads_delete_own"
  ON public.leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = leads.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- WORKFLOWS TABLE POLICIES
-- ==============================================================================
CREATE POLICY "workflows_select_own"
  ON public.workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "workflows_insert_own"
  ON public.workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workflows_update_own"
  ON public.workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "workflows_delete_own"
  ON public.workflows FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AGENTS LIBRARY (public read, user install)
-- ==============================================================================
CREATE POLICY "agents_library_select_public"
  ON public.agents_library FOR SELECT
  USING (is_public = true);

CREATE POLICY "user_installed_agents_select_own"
  ON public.user_installed_agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_installed_agents_insert_own"
  ON public.user_installed_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_installed_agents_delete_own"
  ON public.user_installed_agents FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- INVOICES TABLE POLICIES
-- ==============================================================================
CREATE POLICY "invoices_select_own"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

-- ==============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ==============================================================================
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ==============================================================================
-- INTEGRATIONS TABLE POLICIES
-- ==============================================================================
CREATE POLICY "integrations_select_own"
  ON public.integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "integrations_insert_own"
  ON public.integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "integrations_update_own"
  ON public.integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "integrations_delete_own"
  ON public.integrations FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ==============================================================================
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- BOOKINGS TABLE POLICIES (if exists)
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    EXECUTE 'CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "bookings_insert_public" ON public.bookings FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "bookings_update_own" ON public.bookings FOR UPDATE USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "bookings_delete_own" ON public.bookings FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END;
$$;

-- Verify policy count
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  RAISE NOTICE 'Total RLS policies created: %', policy_count;
END;
$$;
