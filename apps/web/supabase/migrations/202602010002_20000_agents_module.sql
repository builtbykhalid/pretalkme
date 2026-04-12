-- Migration: Agents Module & User Installations
-- Date: 2026-02-01

-- 1. Create table for user installations
create table if not exists user_installed_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  agent_id integer references agents_library(id) on delete cascade not null,
  installed_at timestamptz default now(),
  settings jsonb default '{}'::jsonb, -- Per-user configuration for the agent
  unique(user_id, agent_id)
);
alter table user_installed_agents enable row level security;

-- 2. Add style columns to agents_library if they don't exist
alter table agents_library add column if not exists color_class text;
alter table agents_library add column if not exists bg_class text;

-- 3. RLS Policies

-- agents_library: Everyone (authenticated) can view public agents
drop policy if exists "Authenticated users can view public agents" on agents_library;
create policy "Authenticated users can view public agents" on agents_library
  for select using (auth.role() = 'authenticated' and is_public = true);

-- user_installed_agents: Users can manage their own
drop policy if exists "Users can view their own installed agents" on user_installed_agents;
create policy "Users can view their own installed agents" on user_installed_agents
  for select using (auth.uid() = user_id);

drop policy if exists "Users can install agents" on user_installed_agents;
create policy "Users can install agents" on user_installed_agents
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can uninstall agents" on user_installed_agents;
create policy "Users can uninstall agents" on user_installed_agents
  for delete using (auth.uid() = user_id);

-- agent_requests: Users can view/create their own
drop policy if exists "Users can view their own agent requests" on agent_requests;
create policy "Users can view their own agent requests" on agent_requests
  for select using (auth.uid() = user_id);

drop policy if exists "Users can create agent requests" on agent_requests;
create policy "Users can create agent requests" on agent_requests
  for insert with check (auth.uid() = user_id);

-- 4. Seed Data (Upsert to avoid duplicates)
-- Note: Manually setting ID is only safe if we update the sequence afterwards, but for library items it's fine for now.
insert into agents_library (id, name, category, description, base_prompt, icon_key, color_class, bg_class, is_public)
values 
(1, 'Agent Audit SEO', 'Marketing', 'Analyse technique et sémantique de site web. Détecte les opportunités de mots-clés.',
 'You are an elite SEO Audit specialist working on behalf of the consultant. Identify target keywords, technical SEO weaknesses, content gaps, and top 3 high-impact opportunities. Generate questions that uncover: website URL, target keywords, competitors, traffic sources, and previous SEO work.',
 'Search', 'text-blue-600', 'bg-blue-100', true),
(2, 'Agent Tech Lead', 'Développement', 'Estime la complexité technique, recommande une stack (React/Node) et chiffre le projet.',
 'You are a senior Tech Lead consultant. Assess project scope, technology stack, integrations, risk factors, and effort estimation. Generate questions that reveal: current tech stack, existing codebase, team size, deployment environment, compliance constraints, and expected user volume.',
 'Code', 'text-emerald-600', 'bg-emerald-100', true),
(3, 'Agent Sales Coach', 'Vente', 'Qualifie le BANT (Budget, Authority, Need, Timing) et détecte les signaux d''achat.',
 'You are a B2B Sales Coach. Apply the BANT framework: Budget, Authority, Need, Timing. Detect buying signals and red flags. Generate direct qualification questions that identify decision-makers, investment range, urgency level, and implementation timeline.',
 'Briefcase', 'text-amber-600', 'bg-amber-100', true),
(4, 'Agent Juridique', 'Légal', 'Pré-analyse de contrats et vérification de conformité RGPD de premier niveau.',
 'You are a Legal Consultant assistant specializing in contract analysis and GDPR compliance. Identify the legal domain, urgency, jurisdiction, and complexity. Generate intake questions that reveal the nature of the legal issue, existing documentation, deadlines, and prior legal counsel. Always clarify this is for qualification only, not legal advice.',
 'Scale', 'text-rose-600', 'bg-rose-100', true)
on conflict (id) do update set 
  name = excluded.name,
  description = excluded.description,
  base_prompt = excluded.base_prompt,
  color_class = excluded.color_class,
  bg_class = excluded.bg_class,
  is_public = excluded.is_public;

-- Update sequence to avoid collisions if we insert more
select setval('agents_library_id_seq', (select max(id) from agents_library));
