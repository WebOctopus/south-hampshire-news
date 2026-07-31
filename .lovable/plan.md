# Directory listing edit form + public detail page

## Part 1 — Edit forms (admin + owner)

Both `BusinessEditForm` (admin) and `UserBusinessEditForm` (owner dashboard) get the same treatment.

### Remove dead fields
Drop the "Select category", "Business type" and "Sector type" inputs from both forms and stop sending `category_id`, `biz_type`, `sector` in the save payload. The columns stay in the database untouched.

### New Keywords field
A tag-style multi-entry input replacing the old free-text keywords textarea. It reads and writes `business_keywords`, suggesting from the existing `keywords` table as the user types, with the ability to add a new term.

Three modes:
- **Admin** — add and remove any keyword.
- **Verified owner** (`owner_id = auth.uid()` and `is_verified = true`) — adds with `source = 'owner'`, removes only their own owner rows. CRM-imported tags render muted and locked, owner tags in an accent style with a remove control, and the remaining allowance is shown ("1 of 2 used"). The database cap trigger's error message is surfaced in a toast rather than failing silently.
- **Unverified owner** — read-only chip list with a note that claiming and verifying the listing unlocks editing.

### Labels
- "Description" → "About" (column stays `description`).
- The "Local addition" / location field → "Area": a multi-select of `directory_areas.internal_name` writing rows to `business_areas` (admin form; this form is admin-facing).

### Image upload fix
Pass the stored `logo_url` / `featured_image_url` into the dropzone as its initial value, re-initialise form state when the `business` prop arrives rather than only on first mount, and add a broken-image fallback so a dead remote URL falls back to the upload prompt instead of an empty box. Note: 415 listings have a logo and they are largely external `logo.clearbit.com` URLs, many of which no longer resolve — a likely contributor to the blank preview, to be confirmed during implementation.

### Admin-only Featured toggle
A switch writing `businesses.featured`, rendered for admins only, with an inline warning beside it: the "Set featured advertisers" bulk tool is declarative and sets `featured = false` on anything not in its uploaded list, so a manual toggle here is reverted by the next bulk upload unless that business also carries the CRM's Current Advertiser tag.

## Part 2 — Public detail page

- `BusinessDetail.tsx` switches to `get_business_detail_by_slug_v2`. Its confirmed return fields include `postcode_out`, `postcodes[]`, `keywords[]`, `tier`, all six social URLs, and no `tag` — the page maps `postcode_out` where it previously used `postcode`.
- `BusinessDetailsCard` currently renders the same `phone` value twice (a Phone row and a Smartphone row). Render it once.
- Beneath the website row, a social icon strip for Facebook, Instagram, X/Twitter, LinkedIn, TikTok and YouTube — each icon shown only when its URL is present, in a wrapping flex row so one icon and six both lay out cleanly. The strip is hidden entirely when there are none.
- Nothing public shows an internal area name or number: town and postcode only.

## Technical notes

- One migration is needed. `business_keywords` has admin ALL, owner INSERT and owner DELETE policies but **no SELECT policy**, so a verified owner cannot read their own keyword rows; and adding a brand-new term requires inserting into `keywords`, which is admin-only. The migration adds a SELECT policy on `business_keywords` for the business owner, plus a SECURITY DEFINER RPC that normalises a term, upserts it into `keywords`, links it to the business with the correct `source`, and re-raises the cap trigger's error message. Removal keeps using the existing DELETE policy.
- No column is renamed or dropped; `pricing_areas` and `leaflet_areas` are not touched.
- Public reads stay on SECURITY DEFINER RPCs; the edit forms are authenticated-only and continue to use direct table access.