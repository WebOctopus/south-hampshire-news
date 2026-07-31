# Directory search: postcode + keyword RPC layer

Adds the database functions the new directory search needs, without touching any existing front-end behaviour. Everything is delivered as one migration; the current functions stay in place so the UI can cut over later.

## What gets added

**`get_directory_postcodes()`**
Returns every distinct postcode across the 14 active directory areas, alphabetically. This is the whole location dropdown — no area names or numbers are exposed.

**`suggest_directory_keywords(search_term, postcode, limit_count)`**
Type-ahead suggestions drawn from both the keyword list and business names, limited to active businesses, and narrowed to the areas covering the chosen postcode when one is given. Each suggestion is labelled `keyword` or `business` so the front end can style them differently. Needs at least 2 characters; prefix matches rank above substring matches; capped at `limit_count` (hard max 20).

**New search functions (v2)**
`get_public_businesses_v2`, `get_public_businesses_count_v2`, `get_verified_businesses_v2`, `get_recently_added_businesses_v2`:
- Take `keyword text` and `postcode text` — both mandatory. If either is blank or null, nothing is returned. No browse-by-location, no browse-by-keyword.
- A business matches if any of its keywords matches the term, or the term appears in its name.
- The postcode is resolved to every area whose postcode list contains it, and businesses in any of those areas are returned — once each, never duplicated when a business spans several areas.
- `tag` is removed from the results (internal commercial flags stay server-side).
- Adds a `tier` column: `featured` when featured, else `verified` when verified, else `recent` (neither featured nor verified); results are ordered by tier then name.
- Only live public listings are returned: `is_active = true` and `suppressed = false` on every function.
- Returns each business's keyword list as a text array.

**New detail functions (v2)**
`get_business_detail_by_slug_v2` and `get_business_detail_v2` return everything the current ones do, minus `tag`, plus the six social URLs, the business's postcodes as a text array, and its keyword list as a text array. No area names or numbers — the page shows town and postcode only.

## Technical notes

- All functions are `SECURITY DEFINER`, `STABLE`, `SET search_path = public`, with `EXECUTE` granted to `anon` and `authenticated` (and revoked from `public`).
- New functions are suffixed `_v2` rather than overloading the existing names. Reusing the same names with different parameter types (`category_filter uuid` -> `keyword text`, `edition_area_filter` -> `postcode`) while keeping the old ones would create ambiguous overloads once defaults are involved, and PostgREST would fail to pick one. The existing functions are left completely untouched, so the current directory page keeps working until it is switched over.
- Postcode resolution: `directory_areas` where `is_active` and `postcodes @> array[upper(trim(postcode))]`, then `business_areas.area_code IN (...)`. Deduplication is done with `EXISTS (...)` against `business_areas` instead of a join, so a business in Area 5 and Area 13 is returned exactly once for an SO31 search.
- Keyword matching goes through `business_keywords -> keywords.normalised_term` (same normalisation as the importer) OR `businesses.name ILIKE '%term%'`, so a landscaper tagged "gardener" appears under "gardener" and "Humphries" finds Humphries Digital Aerials.
- `tier` is computed as `featured` / `verified` / `recent`, where `recent` means neither featured nor verified; with 0 verified rows today the practical ordering is featured (104) then the rest.
- `get_verified_businesses_v2` filters to `is_verified`; `get_recently_added_businesses_v2` filters to NOT `is_verified` AND NOT `featured`, ordered by `created_at desc`, so the 104 featured (and currently unverified) listings do not appear in both tiers. Both otherwise share the same keyword/postcode gating.
- Every v2 function — search, verified, recent, count, suggestions and both detail functions — applies `is_active = true` AND `suppressed = false`. That excludes the 172 deactivated legacy listings and honours the newer `suppressed` flag from the start, so the removal flow works as soon as it is used.
- No column is renamed or dropped; `pricing_areas` and `leaflet_areas` are not read or written.

## Follow-up (not in this step)

The directory front end still calls the old RPCs. Cutting `BusinessDirectory`, the verified/recent rows and the business detail page over to the `_v2` functions — and replacing the location dropdown with postcodes and the sector pills with keyword suggestions — is a separate change once these are in place.
