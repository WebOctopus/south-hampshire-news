

## Fix: June missing from start date options due to alphabetical sorting

### Root Cause

The schedule data uses month **names** (e.g., "April", "June", "August") instead of sortable date strings (e.g., "2026-04"). In `src/lib/issueSchedule.ts`, line 272, months are sorted with a simple `.sort()` which sorts alphabetically:

```
Alphabetical order: April, August, December, June, October
Chronological order: April, June, August, October, December
```

After filtering out past months, `.slice(0, 3)` takes the first 3 alphabetically -- "April, August, December" -- skipping June entirely.

### Solution

Update the sorting logic in `getAreaGroupedSchedules` to sort months **chronologically** instead of alphabetically. This requires converting month names (like "June") to a numeric order before sorting.

### Changes

**File: `src/lib/issueSchedule.ts`**

1. Add a helper function to convert month strings to a sortable value. Handle both formats:
   - `"2026-02"` (already sortable)
   - `"June"` with `year` field in the schedule data (needs month-name-to-number conversion)

2. Update `getAreaGroupedSchedules` (around line 272) to sort months chronologically using the helper, instead of the default `.sort()`.

3. Also update the `availableMonths` sort (line 288 area) to ensure consistent chronological ordering throughout.

The helper will look like:

```typescript
function getMonthSortKey(monthStr: string, schedule: any[]): string {
  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(monthStr)) return monthStr;

  // Month name format - find its year from schedule data
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const monthIndex = monthNames.findIndex(
    name => name.toLowerCase() === monthStr.toLowerCase()
  );
  if (monthIndex === -1) return monthStr;

  const scheduleEntry = schedule.find((s: any) => s.month === monthStr);
  const year = scheduleEntry?.year || new Date().getFullYear();
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}
```

Then the sort becomes:

```typescript
const sortedMonths = Array.from(monthsSet).sort((a, b) => {
  const aKey = getMonthSortKey(a, areas[0]?.schedule || []);
  const bKey = getMonthSortKey(b, areas[0]?.schedule || []);
  return aKey.localeCompare(bKey);
});
```

### Impact

- The start date radio buttons will correctly show **April, June, August** (chronologically) instead of **April, August, December** (alphabetically)
- All other places using `getAreaGroupedSchedules` will also benefit from correct ordering
- No changes needed to `BookingSummaryStep.tsx` or any other consumer -- the fix is contained in the utility function

### Summary

| File | Change |
|------|--------|
| `src/lib/issueSchedule.ts` | Add chronological sort helper; update `getAreaGroupedSchedules` sorting (lines 272, 296) |

One file, small change. Fixes the month ordering across all schedule displays.
