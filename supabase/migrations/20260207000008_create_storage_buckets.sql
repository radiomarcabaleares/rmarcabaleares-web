INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images', 'news-images', TRUE, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images', 'ad-images', TRUE, 2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view news images" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-images');

CREATE POLICY "Staff can upload news images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'news-images'
    AND public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Staff can update news images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'news-images'
    AND public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Staff can delete news images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'news-images'
    AND public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Anyone can view ad images" ON storage.objects
  FOR SELECT USING (bucket_id = 'ad-images');

CREATE POLICY "Ad staff can upload ad images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ad-images'
    AND public.get_user_role(auth.uid()) IN ('superadmin', 'publicista')
  );

CREATE POLICY "Ad staff can update ad images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'ad-images'
    AND public.get_user_role(auth.uid()) IN ('superadmin', 'publicista')
  );

CREATE POLICY "Ad staff can delete ad images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'ad-images'
    AND public.get_user_role(auth.uid()) IN ('superadmin', 'publicista')
  );
