

## Limit BOGOF Quote Issues to First 3

### Problem
The View Quote panel currently shows all scheduled issues (e.g. 6 months) for BOGOF (3+ Repeat Package) quotes. The customer only commits to the first 3 issues initially, so only those should be displayed.

### Solution

**File: `src/components/dashboard/ViewQuoteContent.tsx`**

In the `AreaCard` component (line ~81), when the quote is BOGOF, slice the months array to only the first 3 entries before formatting:

```tsx
const areaMonths = hasMonthsData ? (monthsByArea[area.id] || []) : fallbackMonths;
const displayMonths = isBogof ? areaMonths.slice(0, 3) : areaMonths;
const formattedDates = displayMonths.map(m => formatMonthLabel(m, area));
```

Single line change — limits displayed issues to 3 for BOGOF quotes only. All other pricing models continue to show their full schedule.

### Files to change
- `src/components/dashboard/ViewQuoteContent.tsx`

