-- Migration: Setup RLS Policies for Production Security
-- Date: 2026-02-06
-- This script re-enables RLS and defines strict security policies for all tables.
-- It supersedes all previous "dev mode" or "disable RLS" migrations.

-- =================================================================
-- Step 1: Re-enable Row Level Security on all tables
-- =================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_installed_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- Step 2: Drop all existing policies to start from a clean slate
-- =================================================================
-- This is important to remove any old, permissive policies.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename || ';';
    END LOOP;
END $$;

-- =================================================================
-- Step 3: Create helper function to get user role
-- =================================================================
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =================================================================
-- Step 4: Define Policies for each table
-- =================================================================

-- Table: profiles
-- -----------------------------------------------------------------
-- 1. Users can see their own profile

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Users can update their own profile

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. ADMINS have full access

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (get_my_role() = 'admin');


-- Table: forms & leads
-- -----------------------------------------------------------------
-- 1. Users can manage their own forms

CREATE POLICY "Users can manage their own forms"
  ON public.forms FOR ALL
  USING (auth.uid() = user_id);

-- 2. Users can view leads from their own forms

CREATE POLICY "Users can view leads from their own forms"
  ON public.leads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = leads.form_id AND forms.user_id = auth.uid()
  ));
-- Note: Lead creation is handled by a public API endpoint, so no INSERT policy for users.

-- 3. ADMINS have full access

CREATE POLICY "Admins have full access to forms"
  ON public.forms FOR ALL
  USING (get_my_role() = 'admin');



CREATE POLICY "Admins have full access to leads"
  ON public.leads FOR ALL
  USING (get_my_role() = 'admin');


-- Table: agents & marketplace
-- -----------------------------------------------------------------
-- 1. Any authenticated user can see the public agent library

CREATE POLICY "Authenticated users can view public agents"
  ON public.agents_library FOR SELECT
  USING (auth.role() = 'authenticated' AND is_public = true);

-- 2. Users can manage their own installed agents

CREATE POLICY "Users can manage their own installed agents"
  ON public.user_installed_agents FOR ALL
  USING (auth.uid() = user_id);

-- 3. Users can manage their own custom agent requests

CREATE POLICY "Users can manage their own agent requests"
  ON public.agent_requests FOR ALL
  USING (auth.uid() = user_id);

-- 4. ADMINS have full access

CREATE POLICY "Admins have full access to agent library"
  ON public.agents_library FOR ALL
  USING (get_my_role() = 'admin');



CREATE POLICY "Admins have full access to installed agents"
  ON public.user_installed_agents FOR ALL
  USING (get_my_role() = 'admin');



CREATE POLICY "Admins have full access to agent requests"
  ON public.agent_requests FOR ALL
  USING (get_my_role() = 'admin');


-- Table: subscriptions, invoices, integrations, workflows
-- -----------------------------------------------------------------
-- Generic policy: Users can manage their own records

CREATE POLICY "Users can manage their own subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id);



CREATE POLICY "Users can manage their own invoices"
  ON public.invoices FOR ALL
  USING (auth.uid() = user_id);



CREATE POLICY "Users can manage their own integrations"
  ON public.integrations FOR ALL
  USING (auth.uid() = user_id);



CREATE POLICY "Users can manage their own workflows"
  ON public.workflows FOR ALL
  USING (auth.uid() = user_id);

-- ADMINS have full access

CREATE POLICY "Admins have full access to subscriptions" ON public.subscriptions FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Admins have full access to invoices" ON public.invoices FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Admins have full access to integrations" ON public.integrations FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Admins have full access to workflows" ON public.workflows FOR ALL USING (get_my_role() = 'admin');


-- Table: Logs & Settings (Admin only)
-- -----------------------------------------------------------------

CREATE POLICY "Admins have full access to automation logs"
  ON public.automation_logs FOR ALL
  USING (get_my_role() = 'admin');



CREATE POLICY "Admins have full access to audit logs"
  ON public.admin_audit_logs FOR ALL
  USING (get_my_role() = 'admin');



CREATE POLICY "Admins have full access to platform settings"
  ON public.platform_settings FOR ALL
  USING (get_my_role() = 'admin');

-- A read-only policy for users on logs related to their workflows might be needed later.
-- For now, only admins can see them.
