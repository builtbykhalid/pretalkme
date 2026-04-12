-- Migration: Setup Onboarding Storage Bucket
-- Date: 2026-03-08

-- 1. Create the 'onboarding' bucket for temporary processing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'onboarding', 
    'onboarding', 
    true, 
    20971520, -- 20MB limit for audio/pdf
    ARRAY['application/pdf', 'audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies for the onboarding bucket
-- Note: Replace 'onboarding' with the actual bucket ID if different

-- Allow anyone to read from the onboarding bucket (needed for n8n to fetch the file via public URL)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'onboarding' );

-- Allow authenticated users to upload their onboarding files
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( 
    bucket_id = 'onboarding' 
    AND auth.role() = 'authenticated' 
);

-- Allow users to delete their own temporary onboarding files
DROP POLICY IF EXISTS "Users can delete their onboarding files" ON storage.objects;
CREATE POLICY "Users can delete their onboarding files"
ON storage.objects FOR DELETE
USING ( 
    bucket_id = 'onboarding' 
    AND auth.uid() = owner 
);
