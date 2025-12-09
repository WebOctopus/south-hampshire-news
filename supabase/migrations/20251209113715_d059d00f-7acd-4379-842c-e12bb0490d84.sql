-- Create storage bucket for magazine covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('magazine-covers', 'magazine-covers', true);

-- RLS policies for the bucket
CREATE POLICY "Anyone can view magazine covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'magazine-covers');

CREATE POLICY "Admins can upload magazine covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'magazine-covers' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update magazine covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'magazine-covers' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete magazine covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'magazine-covers' 
  AND public.has_role(auth.uid(), 'admin')
);