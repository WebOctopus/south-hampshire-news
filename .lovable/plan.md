## Auto-generate listing URL (slug) on Business listings

The CSV importer already generates a `slug` for each row. The admin `BusinessEditForm` (used for both Create and Edit) does not currently set `slug`, so businesses added or renamed via the admin UI end up with `slug = null` and can't be opened on the new `/business/:slug` route.

### What to change

**File: `src/components/admin/BusinessEditForm.tsx`**

1. Add a small `slugify(name)` helper (same logic as the edge function: lowercase → replace non-alphanumerics with `-` → trim leading/trailing `-`).

2. In `handleSubmit`, before insert/update:
   - Compute `baseSlug = slugify(formData.name) || 'business'`.
   - Query `businesses` for any existing slug that equals `baseSlug` OR starts with `baseSlug-`, excluding the current business id (on update).
   - Pick a final slug using the same fallback order as the importer:
     - `baseSlug` if free
     - else `baseSlug-{slugify(city)}` if city present and free
     - else append `-2`, `-3`, … until free
   - Include `slug: finalSlug` in `saveData`.

3. On Update, only recompute the slug when `formData.name` (or `city`, when city suffix is in play) has changed from `business.name`/`business.city`. If unchanged, keep the existing slug. This avoids surprise URL changes on routine edits.

4. Read-only UI hint: under the Business Name input, display a small muted line "URL: /business/{previewSlug}" computed live from the current name + city, so admins can see what the link will be. No editable slug field — fully automatic per the request.

### Notes

- No DB or edge function changes — the importer flow stays as-is.
- No change to `UserBusinessEditForm` unless you want owners' edits to also regenerate; flag if so.
- Existing imported businesses already have slugs and will be untouched on edit unless their name changes.