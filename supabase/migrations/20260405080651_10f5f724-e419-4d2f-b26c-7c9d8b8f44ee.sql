
-- Storage policies for report-images bucket on storage.objects
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Allow users to update own images" ON storage.objects;
CREATE POLICY "Allow users to update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'report-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow public viewing of report images" ON storage.objects;
CREATE POLICY "Allow public viewing of report images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'report-images');
