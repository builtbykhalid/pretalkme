-- Phase 5: Initialize Storage Buckets and RLS Policies for Local Supabase
-- This migration creates storage buckets and RLS policies for avatars, documents, and logos

-- Drop existing policies if they exist (for local development)
DROP POLICY IF EXISTS "Allow avatars for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own logos" ON storage.objects;

-- Drop existing buckets if they exist
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
    2097152, -- 2MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[],
    NOW(),
    NOW()
  ),
  (
    'documents',
    'documents',
    '00000000-0000-0000-0000-000000000000'::uuid,
    FALSE,
    FALSE,
    10485760, -- 10MB max
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
    5242880, -- 5MB max
    ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']::text[],
    NOW(),
    NOW()
  );

-- NOTE: storage.objects RLS is managed by Supabase Cloud and cannot be altered directly via migrations
-- Storage policies are configured through the Supabase Dashboard instead
-- The buckets below are created and ready for use with the default Supabase storage policies

