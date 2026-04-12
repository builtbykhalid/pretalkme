-- Migration: Disable RLS for development
-- Date: 2026-02-08
-- Purpose: Allow anonymous/unauthenticated access to tables during development

-- Disable RLS on storage.objects for development - TEMPORARY SOLUTION
-- This allows file uploads to work while we figure out proper RLS policies
ALTER TABLE IF EXISTS storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_installed_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.automation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename || ';';
    END LOOP;
END $$;
