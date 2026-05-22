# Move verify CTA into hero + tidy Details header

## Changes

### 1. Verify CTA as a hero action (`BusinessDetailHero.tsx`)
- Remove the standalone verify card currently rendered below the grid in `BusinessDetail.tsx`.
- Add an "Apply to verify" pill/button to the existing hero action row (Call / Website / Email / Directions), shown only when `is_verified` is false.
- Style it consistently with the other hero buttons but visually distinct (e.g. white background with teal text, or amber accent) so it reads as a CTA.
- Clicking it scrolls to / opens the existing `BusinessClaimButton` flow. Two options:
  - a) Render the button inline in the hero (preferred — replaces overlay and panel entirely).
  - b) Keep the bottom panel as a hidden anchor and have the hero pill scroll to it.

Go with (a): inline the claim trigger into the hero row using the existing `BusinessClaimButton` styled to match the other hero pills, or wrap with the same dialog trigger.

### 2. Section header for Details
- In `BusinessDetail.tsx`, render a "Details" section header above `BusinessDetailsCard` matching the Gallery header style (small uppercase muted label with `Info` icon), so Details/Gallery line up visually at the top of their columns.
- Remove the in-card "Details" header from `BusinessDetailsCard.tsx` (the row containing the `Info` icon + "Details" label). Keep card padding and contact rows unchanged.

### 3. Remove the bottom verify panel
- Delete the `{!business.is_verified && (...)}` panel added below the grid in `BusinessDetail.tsx`.

## Out of scope
- Claim dialog behaviour, RPCs, opening hours card, gallery layout.
