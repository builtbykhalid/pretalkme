-- Crée le bucket 'audits' sur Supabase Cloud
-- À exécuter dans : Dashboard → SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'audits',
  'audits',
  true,              -- Public : les URLs sont accessibles sans auth
  20971520,          -- 20 MB max par fichier
  ARRAY['application/pdf'],
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  updated_at = now();
