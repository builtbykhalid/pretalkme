-- Execute this script to set up storage buckets and RLS policies
-- psql -h localhost -U postgres -d postgres -p 54322 -f apply_storage.sql

-- Connect to the project database (should be created by Supabase)
\c postgres

-- Set up storage buckets and RLS policies
DROP POLICY IF EXISTS "Allow avatars for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars - delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own documents - delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own logos - delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

-- Delete existing buckets
DELETE FROM storage.buckets WHERE id IN ('avatars', 'documents', 'logos');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, owner, public, avif_autodetection, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES 
  (
    'avatars',
    'avatars',
    '00000000-0000-0000-0000-000000000000'::uuid,
    FALSE,
    FALSE,
    2097152,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[],
    NOW(),
    NOW()
  ),
  (
    'documents',
    'documents',
    '00000000-0000-0000-0000-000000000000'::uuid,
    FALSE,
    FALSE,
    10485760,
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[],
    NOW(),
    NOW()
  ),
  (
    'logos',
    'logos',
    '00000000-0000-0000-0000-000000000000'::uuid,
    FALSE,
    FALSE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']::text[],
    NOW(),
    NOW()
  );

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for avatars bucket
CREATE POLICY "Allow avatars for authenticated users" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to delete their own avatars - delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for documents bucket
CREATE POLICY "Allow users to read their documents" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to delete their own documents - delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for logos bucket
CREATE POLICY "Allow users to read their logos" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow authenticated users to upload logos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to delete their own logos - delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verify buckets were created
SELECT id, name, public FROM storage.buckets WHERE id IN ('avatars', 'documents', 'logos');
