

## Secure Booking Artwork Bucket (Private + Signed URLs)

### Problem
The `booking-artwork` storage bucket is public, and a `Public can view artwork files` policy on `storage.objects` lets anyone with a URL — including unauthenticated visitors — read every uploaded artwork file. These files may contain proprietary creative for paid bookings and should be private.

### Solution
Make the bucket private, drop the public SELECT policy, and switch the app to short-lived signed URLs for all reads. Existing user-scoped and admin policies on `storage.objects` already allow the right people to access files; signed URLs are issued server-side by Supabase using those policies, so users keep seeing their own artwork and admins keep full access.

### Database migration

1. Set the bucket to private:
   ```sql
   UPDATE storage.buckets SET public = false WHERE id = 'booking-artwork';
   ```
2. Drop the public read policy:
   ```sql
   DROP POLICY IF EXISTS "Public can view artwork files" ON storage.objects;
   ```
3. Keep existing policies untouched:
   - `Users can upload artwork files` (INSERT, owner folder)
   - `Users can view own artwork files` (SELECT, owner folder)
   - `Admin full access artwork files` (ALL, admin role)

### Code changes

**`src/components/dashboard/ArtworkUploadSection.tsx`**
- Replace `getPublicUrl(filePath)` with storing the **storage path** (`filePath`) in `booking_artwork.file_url` instead of a public URL. Existing rows already contain `…/storage/v1/object/public/booking-artwork/<path>` URLs — we'll handle both old and new values when displaying (parse the path out of legacy URLs).
- The upload itself is unchanged (uses authenticated client + RLS).

**`src/components/admin/ArtworkManagement.tsx`**
- Add a small helper `getSignedUrl(fileUrlOrPath)` that:
  - Extracts the object path (strips any `…/booking-artwork/` prefix from legacy public URLs).
  - Calls `supabase.storage.from('booking-artwork').createSignedUrl(path, 3600)`.
- Use it on demand for:
  - The "Eye" preview link (generate signed URL on click, then open).
  - The "Download" button (fetch the signed URL, then blob-download as today).
  - The dialog preview link.

**`src/components/dashboard/ArtworkUploadSection.tsx` (display side)**
- Currently the uploader UI doesn't render a preview link for the user — only filename + status. No display change needed beyond storing the path. If a future preview is added, it should also use `createSignedUrl`.

### Backwards compatibility
Legacy rows store full public URLs. The signed-URL helper handles both shapes by always extracting the path after `/booking-artwork/` (or using the value as-is if it doesn't contain `http`). Once the bucket is private, the legacy public URLs stop resolving directly, but admins/users will reach files through the signed-URL helper instead.

### Files changed
- New SQL migration (bucket privacy + drop policy)
- `src/components/dashboard/ArtworkUploadSection.tsx`
- `src/components/admin/ArtworkManagement.tsx`

### Out of scope
Other security findings in the panel (business_categories permissions, competition_entries, react-router-dom CVE, Postgres patch level) — happy to address in follow-up plans on request.

