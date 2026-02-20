
## Fix: 3+ Package Campaign Schedule Showing Wrong Start Month

### Root Cause

The schedule data in the database has a **mixed month format** — this is the core problem:

- Early months are stored as ISO strings: `"2026-01"`, `"2026-03"` 
- Later months are stored as raw English names with a separate year field: `"April"`, `"May"`, `"June"`, `"July"`, etc.

When the "starting issue" radio options are built in `getAreaGroupedSchedules()` (in `issueSchedule.ts`), the value stored for the user's selection is the raw month name — e.g. `"April"` instead of `"2026-04"`. This creates a cascade of failures:

1. `formatMonthForDisplay("April")` fails to parse `"April"` as a `YYYY-MM` date string, so the label shown is just `"April"` with no year
2. When the user picks `"April"`, `selectedStartingIssue = "April"` (not `"2026-04"`)
3. For areas that publish in Jan/Mar/May cycle (e.g. Chandler's Ford), the comparison code tries `new Date("April" + "-01")` which produces `Invalid Date (NaN)`
4. All `>= NaN` comparisons return `false`, so the "find the next month at or after the start" logic finds nothing
5. A fallback kicks in that simply picks the first schedule entry whose date is after today — which can end up being the wrong month entirely (January 2026 for areas where that entry is present, depending on the comparison)

### The Fix — Two Files

#### 1. `src/lib/issueSchedule.ts` — Normalise month values to YYYY-MM in options

Add an exported helper `normalizeMonthToYYYYMM(monthStr, schedule)` that converts any month string (whether `"April"` or `"2026-04"`) into a consistent `"YYYY-MM"` key, using the `year` field from the schedule entry when available.

Update `getAreaGroupedSchedules` to:
- Use `normalizeMonthToYYYYMM` as the key when building the internal `monthToEntry` map (so all lookups and comparisons use a consistent format)
- Emit option `value` as the normalised `"2026-04"` string, not the raw `"April"` string
- This also fixes `formatMonthForDisplay` labels — `"2026-04"` parses correctly to `"April 2026"`

#### 2. `src/components/BookingSummaryStep.tsx` — Normalise schedule entries before comparison

Add a local helper `normalizeScheduleMonth(s)` inside the render callback that converts a single schedule entry's `month` field to YYYY-MM (using `s.year` when available).

Replace every direct `s.month === startMonth` comparison with `normalizeScheduleMonth(s) === startMonth`, and replace `new Date(s.month + '-01')` with `new Date(normalizeScheduleMonth(s) + '-01')`.

This ensures that even though the database stores `"April"`, the comparison works correctly against `"2026-04"`.

### Example — Before & After

**Before (broken):**
```
selectedStartingIssue = "April"   ← raw month name
new Date("April" + "-01")         ← Invalid Date / NaN
NaN >= NaN                         ← always false → falls to bad fallback
→ Area 2 shows January 2026 ✗
```

**After (fixed):**
```
selectedStartingIssue = "2026-04" ← normalised YYYY-MM
new Date("2026-04-01")            ← valid April 1 date
"2026-03" < "2026-04" → skip     ← March skipped correctly
"2026-05" >= "2026-04" → match   ← May 2026 correctly selected as start
→ Area 2 shows May 2026, July 2026, September 2026 ✓
```

### Files Changed

- `src/lib/issueSchedule.ts` — add helper, update `getAreaGroupedSchedules` to output YYYY-MM values
- `src/components/BookingSummaryStep.tsx` — normalise schedule entry months before all comparisons

No database changes, no edge function changes.
