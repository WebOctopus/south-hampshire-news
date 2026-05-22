# Hide sector pills that conflict with the typed search

## Problem
If a user types a keyword (e.g. "dentist") and then clicks a sector pill that doesn't match (e.g. "Retail"), the combined filter returns zero results. The pill looks clickable but is guaranteed to fail.

## Fix
Make the sector pills aware of the current search term and selected location. When the user has typed something in the search box, only show pills that would actually return at least one business for that search + location. Pills that would produce zero results are hidden, so users can't pick a conflicting combination.

```text
Search keyword → recompute which sector pills are still valid → hide the rest
```

### Behaviour
- No search typed → show all sector pills (current behaviour).
- Search typed + location selected → show only pills whose sector has matching businesses for that search in that area. "All sectors" always remains.
- Search typed but no location yet → still show all pills (we can't know matches until a location is chosen), matching the existing location-gated results grid.
- Clearing the search → all pills return.

### Implementation
1. **New RPC `get_available_sectors(search_term, edition_area_filter)`** — returns the distinct set of sector category ids (matched via either `category_id` or text `sector` ↔ category name) for businesses matching the search term and area, using the same matching logic already in `get_public_businesses`.
2. **Frontend** — in `BusinessDirectory.tsx`, when both `searchTerm` and `selectedLocation` are set, call the new RPC and store the allowed category id set. Pass it into `SectorPills` so it can hide non-matching pills.
3. **`SectorPills`** — accept an optional `availableIds: Set<string> | null`. If provided, render only pills whose `id` is in the set (plus "All sectors"). If null, render everything.
4. **Auto-reset** — if the currently selected pill becomes hidden after a search change, reset `selectedCategory` to `'all'` so results stay coherent.

## Out of scope
- No change to location pills or location filtering.
- No change to the search input or RPC search logic itself.
- No redesign of pill styling.