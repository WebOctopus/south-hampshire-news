

## Add Booked Issues Per Area in BookingDetailsDialog

### Problem
The Distribution Areas section in the Fixed Term payment dialog only shows area names and count, but not which specific issues (months) are booked for each area.

### Solution
Update the Distribution Areas section in `BookingDetailsDialog.tsx` to list each area individually with its booked issues, similar to how `ViewQuoteContent.tsx` already does it.

### Changes

**File: `src/components/dashboard/BookingDetailsDialog.tsx`** (lines ~451-476)

1. Extract `monthsByArea` from `booking.selections?.months` or `booking.selections?.selectedMonths` (matching the data structure used during booking creation)
2. Replace the current single block that lists all area names as a comma-separated string with individual area cards
3. For each area, show:
   - Area name (e.g. "Area 1 - SOUTHAMPTON")
   - Booked issues formatted as month names (e.g. "June 2026, Aug 2026")
4. Use the same `formatMonthLabel` pattern from `ViewQuoteContent` to convert YYYY-MM strings to readable month/year labels
5. Keep the existing count summary below (e.g. "1 area selected")
6. Only apply this enhancement for non-leafleting models (Fixed Term and BOGOF already have months data)

