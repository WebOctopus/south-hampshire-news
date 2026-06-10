# Smarter start-month display on the Cost Calculator

## Problem

The campaign start-month radio list on the calculator currently hides any month whose deadline has passed for the *first* area found in that month — so customers see "August 2026" as the earliest option even when other selected areas (e.g. Area 3 BISHOPSTOKE, Area 4 HEDGE END) can still meet the July copy/print deadline.

Because the "Campaign Schedule—Months 1–6" panel directly underneath already lists per-area issues, copy deadlines and print deadlines, the customer has full visibility — so it's safe (and better for conversion) to surface the earliest month *any* selected area can still hit, rather than waiting until *every* area can hit it.

## Goal

Order the start-month radio list so the **earliest month at least one selected area can still meet** appears first, then the next earliest, etc. — and stop dropping months just because one of the selected areas has already missed its deadline for that month.

## Scope

Frontend / presentation only. No pricing, no DB, no webhook changes.

## Changes

1. **`src/components/AreaAndScheduleStep.tsx` — BOGOF / 3+ start-date list (lines ~228-251)**
   - Replace the current `availableStartDates` logic so a month is considered available if **any** of the selected areas' schedule entries for that month has a print deadline today or later (using existing `isMonthAvailable`), not just the first area's entry.
   - Keep chronological sort; keep the slice to the first 3 future months so the UI stays compact.
   - Add a small helper label under each option listing which selected areas can still take that month (e.g. "Available for: Area 3, Area 4") when not all selected areas qualify — so the customer understands why later areas in the schedule below show different first issues. Wording will use British English and existing terminology.

2. **`src/lib/issueSchedule.ts` — `getAreaGroupedSchedules` (used elsewhere in the calculator)**
   - The current grouping already shows per-schedule-group options, which is correct. No logic change required, but verify the chronological sort uses the earliest-deadline-still-open month first for each group (it does via `normalizeMonthToYYYYMM` + `isMonthAvailable`).

3. **No change** to:
   - The Campaign Schedule—Months 1-6 summary (already correctly shows per-area issues/deadlines).
   - Pricing, totals, webhook payloads, booking persistence.
   - Fixed-term / leafleting per-area month pickers (they already operate per-area).

## Acceptance check

With the screenshot's selection (Areas 1–4, where Areas 3 & 4 still have a July print deadline in the future and Areas 1 & 2 do not):
- The radio list should show **July 2026** as the first option (with a note that it applies to the areas that can still meet it), then August 2026, then October 2026, then the "Later—please call" option.
- The Campaign Schedule—Months 1-6 panel underneath remains unchanged and continues to show each area's actual issue months and deadlines.

## Out of scope

- Allowing different start months per area in BOGOF (the current rule is one global start across all areas).
- Any change to how the chosen start month maps to per-area issue months downstream (areas that can't take the earliest month will fall onto their next available issue, which is already what the schedule summary visualises).
