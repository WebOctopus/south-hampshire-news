## Goal
Add a multi-image **Gallery** manager to both business edit forms (admin `BusinessEditForm` and owner `UserBusinessEditForm`) so the images shown in the new public detail page gallery can be managed in-app. Also fix the storage RLS error currently blocking uploads.

## What's there today
- `businesses.images text[]` already exists and is what the detail page reads.
- `useBusinessImageUpload` uploads single files (logo/featured) to bucket `business-images` at path `${businessId}/${type}-${ts}.ext`.
- Storage RLS on `business-images` requires the **first folder of the path = `auth.uid()`** — so the current `${businessId}/...` path fails with *"new row violates row-level security policy"* (the toast in your screenshot). This must be fixed before any gallery uploads will work.

## Changes

### 1. Storage RLS (migration)
Replace the three owner-folder policies on `storage.objects` for bucket `business-images` with policies that authorise the **business owner** (via `businesses.owner_id`) **or admins** (via `has_role`). Path stays `${businessId}/...`, so we extract `businessId` from `storage.foldername(name)[1]`.

- INSERT / UPDATE / DELETE: allowed when `EXISTS (SELECT 1 FROM businesses WHERE id::text = (storage.foldername(name))[1] AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))`.
- SELECT policy (public) stays.

### 2. Upload hook
Extend `useBusinessImageUpload`:
- Add `'gallery'` to `imageType` union.
- For gallery uploads use `${businessId}/gallery-${ts}-${rand}.${ext}` and `upsert: false` so multiple files coexist.
- Add a `deleteImage(url)` helper that derives the object path from the public URL and calls `storage.remove`.

### 3. New shared component `BusinessGalleryEditor.tsx`
Props: `businessId`, `images: string[]`, `onChange(images)`, `disabled?`.

Behaviour:
- Grid (3 cols desktop / 2 mobile) of existing images with hover overlay → **Remove** button (calls hook delete + updates array).
- Trailing **"Add photo"** dashed tile (`Plus` icon) — opens file picker, accepts multiple, uploads sequentially, appends URLs.
- Reordering: drag handle on each tile (HTML5 drag-and-drop, no new dependency) to set display order.
- Optional max (e.g. 12) with helper text and Max 5MB/JPG-PNG-WebP note matching existing dropzones.
- Styling uses semantic tokens (`bg-muted`, `border-dashed`, `text-muted-foreground`) — mirrors look of the public detail page gallery.

### 4. Wire into both forms
- `BusinessEditForm` (admin): add `images: business?.images || []` to `formData`. Inside the existing **Images** section, render `<BusinessGalleryEditor>` under the Logo/Featured row. Include `images` in the update/insert payload. Gated by "save first" the same way logo/featured currently are.
- `UserBusinessEditForm` (owner): same — extend `formData`, add the editor under Logo/Featured in the **Images** card, include `images` in the update payload.

### 5. Out of scope
- No changes to public detail page (it already renders `business.images`).
- No new DB columns.
- No bulk reorder UI on the admin list page.

## Files touched
- New migration (RLS fix on `storage.objects` for `business-images`).
- `src/hooks/useBusinessImageUpload.ts` — add gallery + delete.
- `src/components/directory/BusinessGalleryEditor.tsx` — new.
- `src/components/admin/BusinessEditForm.tsx` — wire editor + include `images` in payload.
- `src/components/dashboard/UserBusinessEditForm.tsx` — wire editor + include `images` in payload.

## Open questions (optional — defaults shown if no answer)
1. Max gallery images per business? *(default: 12)*
2. Allow drag-to-reorder in v1? *(default: yes, HTML5 native, no new dep)*
