# Directory Search: only show "Update search" when a field changes

## Problem

Once results load, the button stays as "Update search" forever, even when the keyword and postcode still match the search that produced the current results. It should read "Search" until the user actually edits something.

## Change

1. **Dirty detection in `src/pages/BusinessDirectory.tsx`**
   - Compare the live form values (`keyword.trim()`, `postcode`) against the last executed `query`.
   - `isDirty = !!query && (keyword.trim() !== query.keyword || postcode !== query.postcode)`.
   - Pass `isDirty` to `DirectoryHero` instead of using `hasResults` for the button state.
   - Keep `hasResults={!!query}` for the "New search" link, which should stay visible whenever results are showing.

2. **Button label in `src/components/directory/DirectoryHero.tsx`**
   - New prop `isDirty`.
   - Label/icon: `RefreshCw` + "Update search" only when `isDirty`; otherwise `Search` + "Search".
   - Hint text: when `isDirty`, "You've changed your search — click Update search to see new results."; when results are showing and not dirty, keep a neutral line; otherwise the existing prompts.
   - Optional: disable the button when results are showing and nothing has changed, so it is clearly a no-op state. (Left enabled by default unless you prefer disabled.)

## Out of scope

- No changes to the search RPCs, pagination, or results rendering.
- No auto-search on field change — submission stays explicit.

## Verification

1. Search "plumber" + PO12 -> results load, button returns to "Search".
2. Change postcode to PO13 -> button switches to "Update search" with the changed-search hint.
3. Click it -> results update and button reverts to "Search".
4. "New search" still clears everything.
