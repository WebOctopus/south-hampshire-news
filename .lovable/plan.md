## Root cause
The new storage RLS policies on `business-images` reference `(storage.foldername(name))[1]` from inside a subquery `SELECT 1 FROM public.businesses b ...`. Postgres resolves the unqualified `name` to `b.name` (the business name column) instead of the storage object's `name`, so the path/business-id match never succeeds — admins included.

Verified in `pg_policies`:
```
EXISTS (SELECT 1 FROM businesses b
        WHERE b.id::text = (storage.foldername(b.name))[1]   -- ← b.name, wrong
              AND (b.owner_id = auth.uid() OR has_role(auth.uid(), 'admin')))
```

## Fix
New migration that drops and re-creates the three policies (INSERT / UPDATE / DELETE) with the storage-object `name` extracted **outside** the subquery so there's no ambiguity. Pattern:

```sql
CREATE POLICY "Business owners or admins can upload business images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'business-images'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = (string_to_array(storage.objects.name, '/'))[1]
      AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);
```

Using `string_to_array(storage.objects.name, '/')[1]` (or equivalently `split_part`) avoids the `foldername` ambiguity entirely and is fully qualified.

The public SELECT policy stays untouched.

## Files touched
- One new migration file. No frontend changes — the upload path `${businessId}/gallery-…` is already correct.

## Out of scope
- No changes to the upload hook or `BusinessGalleryEditor`.
- No data changes.
