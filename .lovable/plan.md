
# Fix: show earliest start month across ALL selected areas (not just the first schedule group)

## Why July is missing from the radio list

The "When Would You like Your Advertising to Start?" radio list is rendered in **`src/components/BookingSummaryStep.tsx`** (lines 115–290), not in `AreaAndScheduleStep.tsx` (which is why the previous fix had no visible effect on the checkout summary).

It currently does:

```ts
const areaGroupedSchedules = getAreaGroupedSchedules(selectedAreaData);
const availableStartingIssues = areaGroupedSchedules[0].scheduleOptions;
```

`getAreaGroupedSchedules` (in `src/lib/issueSchedule.ts`) **groups areas by identical schedule pattern** and then BookingSummaryStep only ever takes `[0]` — the first group.

With the user's selection:
- Group A — Southampton, Bishopstoke, Hedge End → schedule Aug / Oct / Dec
- Group B — Chandler's Ford → schedule Jul / Sep / Nov

Only Group A's options (Aug, Oct, Dec) are rendered. Chandler's Ford's July, with its 26 Jun print deadline still in the future, is silently dropped — even though the Campaign Schedule panel right below correctly lists "Issues: July 2026, September 2026, November 2026" for Area 2.

## Fix

Build the start-month radio options by **merging months across every selected area** and keeping any month where **at least one** area's print/copy deadline is still in the future. Sort chronologically, show the first 3, then the existing "Later — please call" option.

The per-area Campaign Schedule rows underneath (lines ~303–500) already handle areas that don't publish in the chosen start month by falling through to their next available issue, so no change is needed there.

### Files to change

1. **`src/lib/issueSchedule.ts`** — add a new helper `getCombinedStartingIssues(areaSchedules)` that:
   - Iterates every area's schedule entries.
   - Normalises each `month` to `YYYY-MM` via existing `normalizeMonthToYYYYMM`.
   - Records, per month, which selected areas have that month and whether `isMonthAvailable(entry)` is true.
   - Filters to months with **at least one** still-eligible area.
   - Sorts chronologically, slices to the first 3.
   - Returns `IssueOption[]` of `{ value: 'YYYY-MM', label: 'Month YYYY', month: 'YYYY-MM' }` plus the existing `Later — please call 023 8026 6388` option.
   - Keep `getAreaGroupedSchedules` intact (still used elsewhere for per-group displays).

2. **`src/components/BookingSummaryStep.tsx`** — replace lines 123–125:
   - Use `getCombinedStartingIssues(selectedAreaData)` for `availableStartingIssues`.
   - Leave the `RadioGroup` (lines 270–289) and the downstream per-area schedule rendering unchanged — they already key off `selectedStartingIssue` as a `YYYY-MM` value and gracefully fall an area onto its next available issue if it doesn't publish in that month.
   - Add a short helper note under the radio list: when the currently selected month is only offered by a subset of selected areas, render "Starts this month for {n} of {total} areas. The remaining areas start on their next available issue (see Campaign Schedule below)." in British English, matching existing tone.

3. **`src/components/AreaAndScheduleStep.tsx`** — leave the previous BOGOF-step fix in place (it's still the right behaviour for that earlier step) but no further changes here.

## Acceptance check

With Areas 1–4 selected (Southampton, Chandler's Ford, Bishopstoke, Hedge End) and today = 10 Jun 2026:
- Radio list shows: **July 2026** (first), August 2026, September 2026, then "Later — please call 023 8026 6388".
- Selecting July 2026 keeps Chandler's Ford starting July; the other three areas still display their actual first available issue (August) in the Campaign Schedule panel.
- Selecting August 2026 keeps the existing behaviour for the three areas, and Chandler's Ford falls to September (its next available) — already handled by existing logic on lines 320–350.

## Out of scope

- Pricing, totals, webhook payloads, booking persistence.
- The per-area Campaign Schedule rendering and Months 1–6 mapping.
- Fixed-term and Leafleting per-area pickers in `AreaAndScheduleStep.tsx`.
- Any change to `getAreaGroupedSchedules` (left as-is to avoid affecting other call sites).
