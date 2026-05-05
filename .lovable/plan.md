## Goal
Hide the "Competitions" card on the homepage icon cards row and centre the remaining cards.

## Changes
**File:** `src/components/IconCardsSection.tsx`

1. Filter out the Competitions card from the `cards` array (alongside the existing events/directory visibility filter).
2. Update the desktop grid so cards centre nicely:
   - Replace `hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6` with a flex layout: `hidden md:flex flex-wrap justify-center gap-6`, and give each card a fixed width (e.g. `md:w-[280px]`) so 3 cards align centrally without stretching to fill 5 columns.
3. Mobile horizontal scroll layout stays unchanged (already auto-handles a shorter list).

## Result
Homepage shows: Next Issue Deadline, (Events / Trusted Businesses if visible), Local Stories — Competitions hidden, all centred.
