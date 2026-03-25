

## Add Distribution Dates Inside Leafleting Area Cards

**File: `src/components/dashboard/ViewQuoteContent.tsx`**

The AreaCard already displays distribution months for magazine quotes (lines 104-109), but for leafleting quotes, `monthsByArea` and `fallbackMonths` are empty because the bimonthly derivation logic only runs for non-leafleting contexts.

### Change

Update `deriveFallbackMonths` (lines 50-60) or add leafleting-specific date logic in the AreaCard so that when `isLeafleting` is true:

1. Use `quote.distribution_start_date` and `quote.duration_multiplier` to derive the delivery months
2. Look up each leaflet area's `schedule` array to find matching delivery dates (`deliveryDate` or `delivery_date`)
3. Display these delivery dates inside each area card, formatted as readable dates (e.g., "w/c 15 Jun 2026")

This reuses the existing `formattedDates` rendering block (lines 104-109) that's already in AreaCard -- we just need to ensure the data is populated for leafleting quotes. The leaflet_areas data is already fetched (line 33) and includes the schedule field.

Specifically:
- In `deriveFallbackMonths`, handle leafleting by looking at the leaflet area schedule entries to find delivery dates matching the start date and duration
- Or, add a separate `getLeafletDeliveryDates(area)` helper that extracts delivery dates from the area's schedule, filtered to the quote's booked period, and use those in AreaCard when `isLeafleting` is true

The delivery dates will appear as a calendar icon row beneath the circulation/postcodes line in each area card, matching the existing magazine quote layout.

