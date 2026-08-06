# Directory Search Refresh UX

## Current state

- The directory search bar lives in `src/components/directory/DirectoryHero.tsx` and is rendered by `src/pages/BusinessDirectory.tsx`.
- The form submits to `handleSearch`, which updates `query` and resets pagination, then `runSearch` fetches results.
- The submit button always reads “Search” whether the user is on the initial empty page or already viewing results.
- The user has already typed a keyword + postcode, seen results, changed the postcode, and expects a clearer action to run the updated search.

## Goal

Make it obvious that the search form must be submitted again after changing keyword or postcode, and give the user a clear way to start a brand-new search.

## Changes

1. **Dynamic button label**
   - Add a `hasResults` prop to `DirectoryHero`.
   - When `hasResults` is false, the button label remains “Search”.
   - When `hasResults` is true, the button label changes to “Update search” and the icon changes to `RefreshCw`.
   - This immediately tells the user that the form will re-run the current criteria.

2. **Reset / new-search action**
   - Add a “New search” text link (small, secondary) inside the hero area that appears only when `hasResults` is true.
   - Clicking it clears `keyword`, `postcode`, and `query`, resets the page, and returns the directory to the initial empty state.

3. **Form state feedback**
   - Keep the current hint text, but when `hasResults` is true, show a short secondary line such as: “Change your keyword or postcode above, then click Update search.”

4. **Verify no logic changes are needed**
   - `handleSearch` already updates the query and resets pagination correctly, so no backend or data changes are required.
   - Confirm that the `PostcodeSelect` and `KeywordAutocomplete` components still update their parent values correctly and that the form submit path works unchanged.

## Files to modify

- `src/components/directory/DirectoryHero.tsx` — add `hasResults` prop, dynamic button label/icon, reset link, updated hint.
- `src/pages/BusinessDirectory.tsx` — pass `hasResults` based on `!!query` (or `businesses.length > 0`) and add a `handleReset` function to clear state.

## Out of scope

- No changes to the search RPCs, database, or pagination.
- No automatic refresh on postcode change (the user wants an explicit button).
- No navigation menu changes (the directory nav link remains hidden per previous instructions).

## Verification

1. Load `/business-directory` as a signed-out visitor.
2. Enter “plumber” and “PO12”, click “Search”.
3. Confirm the button label changes to “Update search” and the reset hint appears.
4. Change the postcode to “PO13” and click “Update search”.
5. Confirm the results and heading update to “Results for “plumber” near PO13”.
6. Click “New search” and confirm the form resets to the empty state.
