-- Migration: Ensure RLS is disabled on public tables
-- (auth tables are off-limits)

ALTER TABLE IF EXISTS subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS integrations DISABLE ROW LEVEL SECURITY;
