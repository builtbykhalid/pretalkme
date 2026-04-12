-- Migration: Clean RLS policies and ensure full access
-- Date: 2026-02-08

-- Step 1: Drop ALL policies on all tables
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public agents" ON public.agents_library;
DROP POLICY IF EXISTS "Anyone can read public agents" ON public.agents_library;
DROP POLICY IF EXISTS "Users can manage own agent installations" ON public.user_installed_agents;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.workflows;
DROP POLICY IF EXISTS "Users can read own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can create forms" ON public.forms;
DROP POLICY IF EXISTS "Users can read own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;

-- Step 2: Ensure RLS is disabled on all tables
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
