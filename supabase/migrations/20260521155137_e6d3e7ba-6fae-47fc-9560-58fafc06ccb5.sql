
DROP POLICY IF EXISTS "Users can upload business images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their business images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their business images" ON storage.objects;

CREATE POLICY "Business owners or admins can upload business images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'business-images'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);

CREATE POLICY "Business owners or admins can update business images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'business-images'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);

CREATE POLICY "Business owners or admins can delete business images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'business-images'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);
