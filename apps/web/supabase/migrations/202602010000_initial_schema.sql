-- Initial schema for Pretalk.me (PostgreSQL / Supabase)
-- Generated from docs/Database_Schema.md

-- Enable UUID generator
create extension if not exists pgcrypto;

-- ==========================
-- Table: profiles
-- ==========================
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text,
  role text default 'consultant',
  full_name text,
  avatar_url text,
  company_name text,
  job_title text,
  branding_config jsonb default '{}'::jsonb,
  custom_domain text,
  account_status text default 'active',
  created_at timestamptz default now()
);
alter table profiles enable row level security;

create unique index if not exists idx_profiles_email on profiles(email);

-- ==========================
-- Table: subscriptions
-- ==========================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan_id text,
  status text,
  current_period_end timestamptz,
  usage_limit integer default 0,
  usage_current integer default 0,
  manual_override boolean default false,
  created_at timestamptz default now()
);
alter table subscriptions enable row level security;

-- ==========================
-- Table: forms
-- ==========================
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  slug text,
  status text default 'draft',
  form_structure jsonb default '[]'::jsonb,
  ai_config jsonb default '{}'::jsonb,
  views_count integer default 0,
  leads_count integer default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table forms enable row level security;
create unique index if not exists idx_forms_slug on forms(slug);

-- ==========================
-- Table: leads
-- ==========================
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  form_id uuid references forms(id) on delete set null,
  respondent_info jsonb,
  static_answers jsonb,
  dynamic_answers jsonb,
  ai_analysis_draft text,
  final_report_pdf text,
  score integer default 0,
  score_reason text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table leads enable row level security;
create index if not exists idx_leads_form_id on leads(form_id);

-- ==========================
-- Table: agents_library
-- ==========================
create table if not exists agents_library (
  id serial primary key,
  name text,
  category text,
  description text,
  base_prompt text,
  n8n_template_id text,
  icon_key text,
  is_public boolean default true,
  created_at timestamptz default now()
);
alter table agents_library enable row level security;

-- ==========================
-- Table: agent_requests
-- ==========================
create table if not exists agent_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  agent_name text,
  objective text,
  budget_range text,
  timeline text,
  admin_status text default 'pending',
  admin_notes text,
  quote_amount numeric(12,2),
  created_at timestamptz default now()
);
alter table agent_requests enable row level security;
create index if not exists idx_agent_requests_user_id on agent_requests(user_id);

-- ==========================
-- Table: integrations
-- ==========================
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  provider text,
  access_token text,
  settings jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table integrations enable row level security;

-- ==========================
-- Table: workflows
-- ==========================
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  form_id uuid references forms(id),
  trigger_event text,
  trigger_condition jsonb default '{}'::jsonb,
  action_type text,
  webhook_url text,
  payload_config jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table workflows enable row level security;
create index if not exists idx_workflows_user_id on workflows(user_id);

-- ==========================
-- Table: automation_logs
-- ==========================
create table if not exists automation_logs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  status text,
  external_execution_id text,
  response_payload jsonb,
  created_at timestamptz default now()
);
alter table automation_logs enable row level security;
create index if not exists idx_automation_logs_workflow_id on automation_logs(workflow_id);

-- ==========================
-- Table: admin_audit_logs
-- ==========================
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references profiles(id) on delete set null,
  action text,
  target_resource text,
  details jsonb,
  created_at timestamptz default now()
);
alter table admin_audit_logs enable row level security;

-- ==========================
-- Table: platform_settings
-- ==========================
create table if not exists platform_settings (
  key text primary key,
  value jsonb,
  description text,
  updated_at timestamptz default now()
);
alter table platform_settings enable row level security;

-- Basic grants for supabase internal usage (adjust as needed)
-- Note: Enabling RLS above requires explicit policies for access. Add policies
-- according to your auth rules (e.g. allow authenticated users to read their own rows).
