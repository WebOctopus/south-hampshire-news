## Goal
Remove the gap between the About card and Gallery on the business detail page by moving Gallery into the left column, directly below About (and above Meet the Owner).

## Change
In `src/pages/BusinessDetail.tsx`:
- Move the `<section>` Gallery block out of its current full-width position below the grid.
- Place it inside the left column (`lg:col-span-2`) immediately after the About card and before `MeetTheOwnerCard`.
- Replace `mt-8` with the column's existing `space-y-[14px]` spacing so it sits flush with About.

No changes to functionality, data, or gallery logic.
