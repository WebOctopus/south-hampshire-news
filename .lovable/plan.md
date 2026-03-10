

## Show Distribution Dates on Area Cards in View Quote

### Problem
The View Quote dialog shows areas with circulation and postcodes, but not when each area is scheduled for distribution.

### Changes

**`src/components/dashboard/ViewQuoteContent.tsx`**:

1. **Pass quote selections to AreaCard**: Extract `selections.months` from the quote (a `Record<areaId, string[]>` like `{ "uuid": ["2025-12", "2026-01"] }`).

2. **Update AreaCard** to accept `selectedMonths` and show them as formatted dates (e.g., "Dec 2025, Jan 2026") with a Calendar icon. Cross-reference with the area's `schedule` array to show delivery dates when available — if a matching schedule entry has a `deliveryDate`/`delivery_date`, display that; otherwise fall back to displaying the month/year.

3. **Display**: Add a line below the circulation/postcodes row:
   ```
   📅 Dec 2025, Jan 2026
   ```
   Small muted text, same style as the existing circulation line.

This uses data already stored in `quote.selections.months` — no database changes needed.

