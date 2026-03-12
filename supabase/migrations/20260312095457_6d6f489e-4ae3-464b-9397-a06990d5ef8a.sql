
-- Create media-library storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-library', 'media-library', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for media library"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-library');

-- Allow admin upload
CREATE POLICY "Admin upload access for media library"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media-library' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admin update
CREATE POLICY "Admin update access for media library"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media-library' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admin delete
CREATE POLICY "Admin delete access for media library"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media-library' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
