## Filter Verified + Recently Added rows by directory search criteria

Both rows currently fetch with no filters. The `get_verified_businesses` and `get_recently_added_businesses` RPCs already accept `search_term`, `category_filter`, `edition_area_filter`, and `tag_filter`. Wire those through so the rows respect the user's current search/sector/location/tag.

### Changes

**`src/components/directory/VerifiedBusinessesRow.tsx`**
- Add props: `searchTerm`, `selectedCategory`, `selectedLocation`, `selectedTag`.
- Pass them to the RPC (mapping `'all'` → `null`/omitted). Re-run the effect when any change.
- Keep current "hide row when zero results" behavior — so the section disappears when nothing matches.

**`src/components/directory/RecentlyAddedRow.tsx`**
- Same prop additions and RPC argument wiring.
- Same "hide when empty" behaviour.

**`src/pages/BusinessDirectory.tsx`**
- Pass the four filter values into both `<VerifiedBusinessesRow />` and `<RecentlyAddedRow />`.

### Out of scope
- No DB/RPC changes (filters already supported).
- No change to the main results grid behaviour or the location-gating logic.
- No card layout changes.
