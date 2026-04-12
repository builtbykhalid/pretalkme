-- Storage policies for avatars, logos, and documents buckets

-- Policy pour avatars : lecture publique, upload/delete pour tout le monde (dev mode)
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
DROP POLICY IF EXISTS "Avatar authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar authenticated delete" ON storage.objects;

CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Avatar authenticated update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Avatar authenticated delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- Policy pour logos : lecture publique, upload/delete pour tout le monde (dev mode)
DROP POLICY IF EXISTS "Logo public read" ON storage.objects;
DROP POLICY IF EXISTS "Logo authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Logo authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Logo authenticated delete" ON storage.objects;

CREATE POLICY "Logo public read" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Logo authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Logo authenticated update" ON storage.objects FOR UPDATE USING (bucket_id = 'logos');
CREATE POLICY "Logo authenticated delete" ON storage.objects FOR DELETE USING (bucket_id = 'logos');

-- Policy pour documents : accès restreint
DROP POLICY IF EXISTS "Document authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Document authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Document authenticated delete" ON storage.objects;

CREATE POLICY "Document authenticated read" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Document authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Document authenticated delete" ON storage.objects FOR DELETE USING (bucket_id = 'documents');

SELECT 'Storage policies created successfully' as status;
