-- Run this in the Supabase Dashboard → SQL Editor
-- Creates the public "onboarding" bucket used for PDF/audio uploads during onboarding.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'onboarding',
    'onboarding',
    true,
    20971520,
    ARRAY['application/pdf', 'audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['application/pdf', 'audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg']::text[];

-- 2. Allow authenticated users to upload their onboarding files
DROP POLICY IF EXISTS "onboarding_insert_authenticated" ON storage.objects;
CREATE POLICY "onboarding_insert_authenticated"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'onboarding'
    AND auth.role() = 'authenticated'
);

-- 3. Public read – n8n needs to fetch the file via public URL
DROP POLICY IF EXISTS "onboarding_select_public" ON storage.objects;
CREATE POLICY "onboarding_select_public"
ON storage.objects FOR SELECT
USING ( bucket_id = 'onboarding' );

-- 4. Users can delete their own files
DROP POLICY IF EXISTS "onboarding_delete_own" ON storage.objects;
CREATE POLICY "onboarding_delete_own"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'onboarding'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'onboarding';
