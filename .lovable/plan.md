
Goal: Fix PAYG Fixed Term issue checkboxes so they consistently show `Month YYYY` (e.g. `April 2026`) using the same schedule source as 3+, and stop mixed date formatting.

What I found
- The Fixed Term issue checkbox UI is rendered in `src/components/AreaAndScheduleStep.tsx`.
- Its local `formatMonthDisplay(monthString)` returns plain month names unchanged (e.g. `April`) when `month` is stored without year.
- Your backend `pricing_areas.schedule` is mixed-format (`2026-02` plus `April`, `June`, etc.) with a `year` field, so year is available but currently ignored for those month-name entries.
- This is why Fixed Term can show month-only labels while 3+ uses normalized `YYYY-MM` logic elsewhere.

Implementation plan
1) Unify month label generation in Area & Schedule step
- File: `src/components/AreaAndScheduleStep.tsx`
- Replace local month display handling with shared schedule normalization from `src/lib/issueSchedule.ts`:
  - use `normalizeMonthToYYYYMM(...)` + `formatMonthForDisplay(...)`
- Create a helper that takes the schedule item and schedule list, derives a normalized key, and always returns `Month YYYY`.
- Apply this helper to Fixed Term issue checkbox labels (the exact UI you flagged).

2) Normalize the selected issue value for Fixed Term
- Still in `AreaAndScheduleStep.tsx`, when a month is toggled:
  - store a normalized `YYYY-MM` key instead of raw month text
  - keep backward compatibility when checking existing selections by supporting both legacy raw values (`April`) and normalized values (`2026-04`) during comparison
- Result: labels and stored selections are aligned with backend intent and future-proofed.

3) Keep downstream summaries consistent with the same normalized source
- File: `src/components/AdvertisementSizeStep.tsx`
  - Update “Selected issues” formatting so any legacy month-name values also render with year using schedule year hints.
- File: `src/components/FixedTermBasketSummary.tsx`
  - Update `formatSelectedMonths(...)` to handle both legacy month names and normalized `YYYY-MM`, rendering consistent readable labels.
- This prevents mixed display between step checkboxes and later review screens.

4) Cleanup
- Remove now-unused import(s) in `AreaAndScheduleStep.tsx` after switching to shared helpers.

Validation checklist
- In `/advertising#calculator` → PAYG Fixed Term:
  - Issue checkbox labels show `Month YYYY` (not month-only).
  - Selecting/deselecting still works with max-issues rules.
- Continue to next steps:
  - “Selected issues” in summaries also show `Month YYYY`.
- Save a quote:
  - `selections.selectedMonths` is normalized (`YYYY-MM`) for new selections.
- Regression check:
  - 3+ flow labels remain unchanged and consistent.

Scope
- Frontend-only fix.
- No DB migration required.
