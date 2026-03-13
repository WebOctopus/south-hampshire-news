

## Bug Fix: "Failed to save quote to database"

### Root Cause

Line 359 in `AdvertisingStepForm.tsx` builds `distribution_start_date` from `selectedMonths`, which contains month **names** like `"May"` or `"April"` (not `YYYY-MM` format). This produces invalid date strings like `"May-01"` or `"April-01"`, which Postgres rejects for its `date` column type.

From the edge function logs, we can see:
```
selectedMonths: { "area-id": ["May"], "area-id-2": ["April"] }
```

The code does:
```typescript
Object.values(campaignData.selectedMonths || {})[0]?.[0] + "-01"
// Results in: "May-01" — invalid date!
```

### Fix

**File: `src/components/AdvertisingStepForm.tsx`** (line 359)

Change the `distribution_start_date` logic to handle month names gracefully:
- If `selectedStartingIssue` is present and is in `YYYY-MM` format, use it (existing behavior, works fine)
- If falling back to `selectedMonths`, and the value is a month name (not `YYYY-MM`), set it to `null` instead of producing an invalid date string
- This matches how bookings handle the same field — the booking webhook logs show `distribution_start_date: null` works fine

Single-line change. No database or edge function changes needed.

