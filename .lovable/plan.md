## Directory Redevelopment Plan

### 1. Database changes (migration)

- Add `tag TEXT` column to `businesses` (nullable, indexed for filtering).
- Ensure `slug TEXT UNIQUE` column on `businesses` is populated and indexed (column already exists, currently unused).
- Add lookup function `get_business_detail_by_slug(slug TEXT)` mirroring existing `get_business_detail`.
- Update `get_public_businesses` and `get_public_businesses_count` RPCs to:
  - Return `slug` and `tag` fields.
  - Accept new optional `tag_filter TEXT` argument.
- Add `get_distinct_tags()` RPC for the filter dropdown.
- Wipe directory data in this order to clear FK-style relationships:
  1. `business_claim_requests`
  2. `business_reviews`
  3. `featured_advertisers` rows where `business_id IS NOT NULL` (set null or delete — recommend delete since they're directory-tied)
  4. `businesses`

### 2. CSV import (`import-businesses-csv` edge function + admin UI)

- Add `Tag` column to `COLUMN_MAPPING` (maps to `businesses.tag`).
- On insert, generate a slug from `name`:
  - Base: lowercase, hyphenate, strip non-alphanumeric (reuse `slugify_text` SQL function pattern in JS).
  - On collision within the same import or against the DB, append `-{citySlug}`.
  - If still colliding, append `-2`, `-3`, etc.
- Update Column Mapping table and Preview table in `CSVImportManagement.tsx` to include Tag.
- Template download includes `Tag` header.

### 3. Frontend routing

- Change route from `/business/:id` to `/business/:slug` in `App.tsx`.
- `BusinessDetail.tsx` reads `slug` param, calls `get_business_detail_by_slug`.
- `BusinessCard.tsx` navigates to `/business/${business.slug}`.
- `BusinessDirectory.tsx` Business interface gains `slug` and `tag`.

### 4. Directory filter + badge

- Add Tag dropdown to `BusinessDirectory.tsx` next to Location, populated from `get_distinct_tags()`.
- Pass `tag_filter` through to RPC calls.
- `BusinessCard.tsx`: render tag as a badge alongside category/biz_type.

### 5. Cleanup

- Remove any stale UUID-based deep links in code (search for `/business/${...id}`).
- Update memory note `mem://rules/business-directory` to reflect slug routing + tag column.

### Technical notes

- Slug generation in edge function uses simple regex: `name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')`. City suffix uses same transform on `city` value.
- Collision check: build a `Set<string>` of slugs allocated in current batch, plus a single bulk SELECT of existing slugs at start of the function (cheap since we just wiped the table on replaceAll, and reasonable otherwise).
- Existing UUID-based URLs will 404 — acceptable per "redevelop" framing and confirmed by deletion choice.
- RLS unchanged; new RPCs use `SECURITY DEFINER` like existing siblings.
