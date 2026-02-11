INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'program-images', 'program-images', TRUE, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view program images" ON storage.objects
  FOR SELECT USING (bucket_id = 'program-images');

CREATE POLICY "Superadmin can upload program images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'program-images'
    AND public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "Superadmin can update program images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'program-images'
    AND public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "Superadmin can delete program images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'program-images'
    AND public.get_user_role(auth.uid()) = 'superadmin'
  );
