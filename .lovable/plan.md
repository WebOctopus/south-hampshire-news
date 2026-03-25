

## Improve Quote Details View

### Problems (from screenshot)
1. Label says "Campaign Total" — user wants just "Cost"
2. No distribution schedule/months shown for leafleting quotes
3. Area cards lack delivery dates from the leaflet area schedule data

### Changes

**File: `src/components/dashboard/ViewQuoteContent.tsx`**

1. **Rename label**: Change `'Campaign Total'` (line 152) to `'Cost'` for leafleting quotes

2. **Show distribution start date**: Add a row displaying `quote.distribution_start_date` formatted as a readable date (e.g., "March 2026") when available

3. **Show leaflets required by date**: Display `quote.leaflets_required_by` if present

4. **Show scheduled months on leafleting area cards**: The leaflet areas have a `schedule` JSON field with delivery dates. The `AreaCard` component already supports showing months via `formatMonthLabel`, but for leafleting the `monthsByArea` from `selections.months` may be empty. Update the fallback logic to also derive months from `distribution_start_date` + `duration_multiplier` for leafleting quotes (this already exists in `deriveFallbackMonths`). Ensure the fallback months are applied to leafleting area cards so delivery dates appear.

5. **Show duration/number of issues**: Display `quote.duration_multiplier` as "X issues" when available for leafleting

6. **Show leaflet size**: Pull leaflet size from `selections.leafletSize` or similar if stored, and display it

All other existing content (campaign type, status, area selection cards with circulation/postcodes, contact info, created date) remains unchanged.

