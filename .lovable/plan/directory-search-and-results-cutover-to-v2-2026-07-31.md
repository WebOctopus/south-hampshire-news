# Directory search and results cutover to v2

Rebuild the directory search bar and results list on the v2 RPC layer. Nothing else on the site changes; the old RPCs stay in place, just unused by this page.

## Search bar

Two required fields, side by side, plus a Search button.

- **Postcode** — single-select dropdown populated from `get_directory_postcodes()`. Searchable/filterable list (there are a lot of postcodes). No area name or number appears anywhere.
  - The filter is tolerant of full postcodes: typing "SO30 2QT" or "so302qt" selects the SO30 option. Typed text is stripped of whitespace and uppercased, the outward portion (leading letters plus the digits before the inward code) is extracted and matched against the options, with a plain prefix match as fallback for partial entries like "SO3". A valid full postcode never returns "no matches".
- **Keyword** — autocomplete input backed by `suggest_directory_keywords(search_term, postcode)`. Fires from 2 characters, debounced 250ms, shows at most 8 suggestions. Each suggestion carries a `kind`:
  - `keyword` — plain text with a small tag-style icon
  - `business` — shown with a distinct "Business" label chip and different weight, so a company name never reads as a trade
  - No matches: the dropdown shows "No matching listings", never an empty box.
- The Search button is disabled until both a keyword and a postcode are set, with helper text under the fields naming what's still missing ("Choose a postcode to search", etc.), so the disabled state is explained rather than mysterious.
- Nothing is fetched until both are set — no partial results from one field.

The Sector pills, location pills, category filter and tag filter are removed from this page.

## Results

One continuous list, ordered by the `tier` column from `get_public_businesses_v2` (featured, then verified, then recent). A light divider with a tier label introduces each run of cards, but it is a single flowing list, not three stacked sections. A tier with no rows renders nothing at all — with 0 verified listings today the page must read as complete, not broken.

**Featured** — 2 per row, the visually heaviest card: logo, name, town + postcode, description truncated to ~160 characters, up to 3 gallery thumbnails from `images`.

**Verified** — 3 per row: logo, name, town + postcode, website, verified badge styled as a trust marker (calm green/outline), deliberately not more prominent than Featured.

**Recently Added** — 3 per row, minimal: name, town + postcode, website link.

**Empty states** — with most listings lacking a logo, gallery or description:
- No logo: a generated monogram tile using the existing `BusinessIcon` component, never a broken image.
- No description: the About line is omitted entirely, no placeholder box.
- No gallery: the thumbnail strip is omitted; a 1- or 2-image gallery lays out naturally rather than leaving grey gaps.
- No website / no town: those rows are simply absent. Nothing renders "undefined".
- Images that fail to load are hidden on error.

Paging keeps the existing pager, driven by `get_public_businesses_count_v2`.

## Technical notes

- RPCs used: `get_directory_postcodes`, `suggest_directory_keywords(search_term, postcode, limit_count)`, `get_public_businesses_v2(keyword, postcode, limit_count, offset_count)`, `get_public_businesses_count_v2(keyword, postcode)`. All via `supabase.rpc(...)` — no `supabase.from()` against `businesses`, `business_areas`, `business_keywords` or `directory_areas` on this page.
- Note `get_public_businesses_v2` returns the postcode as `postcode_out`; the card components read that field.
- No database migration. No column renamed or dropped. `pricing_areas` and `leaflet_areas` untouched.
- Files: rewrite `src/components/directory/DirectoryHero.tsx` (postcode select + keyword autocomplete), add `src/components/directory/FeaturedBusinessCard.tsx` and `TieredResultsList.tsx`, adapt `VerifiedBusinessCard` and `RecentBusinessCard` to the v2 shape, and rewrite the data-fetching in `src/pages/BusinessDirectory.tsx`.
- `VerifiedBusinessesRow` and `RecentlyAddedRow` (the separate stacked sections) are removed from the page; the old RPCs they used stay in the database.
