UPDATE storage.buckets SET public = false WHERE id = 'booking-artwork';

DROP POLICY IF EXISTS "Public can view artwork files" ON storage.objects;