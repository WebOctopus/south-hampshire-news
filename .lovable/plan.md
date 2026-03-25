

## Fix: Show Distribution Dates for Existing Leafleting Quotes

**Problem**: The `getLeafletDeliveryDates` function returns empty when `quote.distribution_start_date` is null (which it is for older quotes). No dates appear in the area cards.

**File: `src/components/dashboard/ViewQuoteContent.tsx`**

### Change

Update `getLeafletDeliveryDates` to add a fallback when `distribution_start_date` is missing:

1. If `distribution_start_date` exists — keep current logic (filter schedule from that date onward, take `duration_multiplier` entries)
2. If `distribution_start_date` is missing — fall back to showing the first `duration_multiplier` (or all) schedule entries from the area's schedule, sorted chronologically. If `duration_multiplier` is also missing, show all future schedule entries.

This ensures both old and new quotes display delivery dates from the area's schedule data, regardless of whether the quote has a stored start date.

### Technical Detail

In `getLeafletDeliveryDates` (line 87), change the early return:
- Remove the `!quote.distribution_start_date` bail-out
- When no `distribution_start_date`, skip the date-range filter and just take the first N schedule entries sorted by month
- Keep everything else (formatting, delivery date lookup) the same

