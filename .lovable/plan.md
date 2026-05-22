# Verified Businesses row — "plumbing" search

## Finding

The behaviour you described is **already what the code does**:

- `VerifiedBusinessesRow` passes `selectedLocation` to `get_verified_businesses` only when it is not `'all'`. If no location is selected, the location filter is omitted.
- I ran the RPC directly with `search_term = 'plumbing'` and no location filter, and **MJM Plumbing & Heating Ltd** is returned (it's the only verified business matching "plumbing").
- MJM is in **Area 7** only (SO32 Meon Valley / PO17 Wickham). So as soon as any other area is selected (hero dropdown or location pill), MJM is correctly filtered out.

## Most likely cause of what you saw

A location was selected at the time you searched — either:
- The hero "Your location" dropdown, or
- A pill in the **Location** row below the sector pills (clicking one sets `selectedLocation`).

If neither is set (both showing "all"), MJM will appear in the Verified row when you type "plumbing".

## Proposed action

No code changes. To verify:

1. On `/business-directory`, click any selected location pill again to deselect (or pick "Your location" → default) so `selectedLocation === 'all'`.
2. Type `plumbing` in the search box.
3. MJM Plumbing & Heating Ltd should appear in the Verified Businesses row.

If after step 1–3 MJM still doesn't appear, it's a real bug and I'll dig further (likely candidates: stale request, pill component not resetting to `'all'`, or search not flowing into the row).

## Optional small polish (only if you want it)

- Show a subtle "Filtered by: *Area name*" chip above the Verified row when a location is active, so it's obvious why fewer (or zero) verified results appear.

Let me know if you'd like the polish chip, or if you can confirm a location was selected when you tested.
