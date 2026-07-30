## Goal
Restructure `/business-directory` so the curated business rows sit immediately under the hero, and the sector/location pill filters are removed.

## Current layout
1. DirectoryHero (search + location dropdown)
2. Sector pills + location pills
3. Verified businesses
4. Recently added
5. Full results grid (location-gated, heading = "Featured Businesses" when no category selected)

## New layout
1. DirectoryHero
2. Verified businesses
3. Recently added
4. Full results grid

## Changes
1. **Remove the sector/location pills section** from `src/pages/BusinessDirectory.tsx`.
   - Delete the `<section>` containing `SectorPills` and `LocationPillsGrid`.
   - Remove the `SectorPills` and `LocationPillsGrid` imports.
   - Remove the `availableCategoryIds` state and the `get_available_sectors` effect that existed only to drive the sector pills.
   - `selectedCategory` will stay `'all'`; it is still passed down to the curated rows but has no user-facing control.

2. **Move curated rows up** so `VerifiedBusinessesRow` and `RecentlyAddedRow` render directly after `DirectoryHero`.

3. **Tidy the full-results heading** to avoid a duplicate "Featured Businesses" label now that the curated rows occupy that name. Change the grid heading to `"All Businesses"` (or `"Businesses"`) when no category is selected.

4. **Verify** the page loads, the hero search/location dropdown still works, and the two curated rows appear under the hero.

## Out of scope
- No changes to `DirectoryHero`, `VerifiedBusinessesRow`, `RecentlyAddedRow`, or the data-fetching logic inside them.
- No changes to the full-results grid behaviour (still location-gated).
- No backend or edge-function changes.