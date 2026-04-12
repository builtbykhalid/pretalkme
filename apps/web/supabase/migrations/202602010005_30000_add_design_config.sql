-- Migration: Add design_config to forms
-- Date: 2026-02-01

alter table forms add column if not exists design_config jsonb default '{}'::jsonb;
