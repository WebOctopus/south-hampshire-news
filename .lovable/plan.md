# Predictive search + dynamic sector pills

## Goal
Make the directory search work like a typeahead, and only reveal the sector pill row once the user has chosen a location and run a search. The pills then reflect the typed keyword dynamically.

```text
Type keyword → live suggestions dropdown
Pick location + click Search → sector pills appear, filtered to the keyword
```

## Behaviour

### Search bar (predictive)
- As the user types in the hero search input (debounced ~250ms, min 2 chars), show a dropdown beneath the input listing matching businesses (name + sector + city).
- Each suggestion is clickable: clicking it jumps straight to that business's detail page.
- A "See all results for '<term>'" row at the bottom runs the same action as the Search button (requires a location).
- If no location is chosen yet, suggestions still appear (across all areas) but the footer row prompts the user to pick a location first.
- Suggestions hide on blur / Escape / selection.

### Sector pills (gated + dynamic)
- Hidden by default on page load.
- Remain hidden until BOTH: a location is selected AND the user has clicked Search (or picked a suggestion that triggered a search) with a non-empty keyword.
  - If the user picks a location but types nothing and clicks Search, pills appear showing every sector that has businesses in that area.
  - If the user types but never picks a location / clicks Search, pills stay hidden.
- Once visible, the pill set is derived dynamically from the active (committed) search term + location via `get_available_sectors`. Pills that would yield zero results are not rendered. "All sectors" is always shown.
- Editing the search term after committing does NOT live-mutate the pills; the pills only refresh on the next Search click / suggestion selection. This keeps results and pills in sync.
- Clearing the location hides the pills again.

## Technical notes

1. **New committed state** in `BusinessDirectory.tsx`:
   - `committedSearch: string` and `hasSearched: boolean`. Set when the user clicks Search or picks a suggestion. `searchTerm` stays as the live input value (used for suggestions only).
   - Replace existing uses of `searchTerm` in `fetchBusinesses` / `fetchTotalCount` / `get_available_sectors` with `committedSearch`.
   - Show `<SectorPills>` only when `selectedLocation !== 'all' && hasSearched`.

2. **Predictive dropdown** — new lightweight component `SearchSuggestions` rendered inside `DirectoryHero` under the input. Uses existing `useDebounce` hook + a new RPC `search_businesses_suggest(search_term, edition_area_filter, limit_count)` returning `{ id, slug, name, sector, city }` (top 8). Matching mirrors `get_public_businesses` (name | description | sector | biz_type | city | postcode | keywords, case-insensitive).

3. **`DirectoryHero` prop additions**: `suggestions`, `onSuggestionPick(business)`, `showSuggestions`, `onCloseSuggestions`. Existing `onSearch` continues to commit the search.

4. **No changes** to location pills grid, location filtering, RLS, or pill styling.

## Out of scope
- Fuzzy matching / typo tolerance (plain ILIKE only).
- Keyboard arrow navigation in the dropdown (Esc + click only for now).
- Changes to verified / recently-added rows.