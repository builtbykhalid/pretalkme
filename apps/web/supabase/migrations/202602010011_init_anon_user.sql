-- Create a default anonymous user in auth.users for development
-- Note: This is for local development only

-- Get the JWT secret from config (usually in .env or config.toml)
-- The default local dev JWT is already set

-- Enable anonymous sign-ups to auto-create users when signInAnonymously is called
-- Already enabled in config.toml: enable_anonymous_sign_ins = true

-- Optional: Create a default profile for development
-- This will be auto-created by the trigger when auth.users creates a new user

-- Verify RLS is disabled on all public tables
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_installed_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;

-- Verify policies are dropped
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create forms" ON public.forms;
DROP POLICY IF EXISTS "Users can read own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can read own leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can read public agents" ON public.agents_library;
DROP POLICY IF EXISTS "Users can manage own agent installations" ON public.user_installed_agents;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.workflows;
DROP POLICY IF EXISTS "Enable read access for invoices" ON public.invoices;

-- Ensure PostgREST bypass policy for development (PostgreSQL 15+)
-- This is handled by RLS being DISABLED above
