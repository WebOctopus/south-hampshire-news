# Move "Apply to verify" card below the details

## Problem
On unverified business pages (e.g. M Coghlan Ltd), the "Apply to verify this business" card is rendered as an absolute-positioned overlay on top of the content grid, which blocks the gallery and details cards.

## Change
In `src/pages/BusinessDetail.tsx`, remove the absolute overlay wrapper and render the verify card inline, directly underneath the two-column content grid (gallery / details / opening hours) and above the "Back to Directory" link.

- Keep the same content: heading, voucher description, `BusinessClaimButton`.
- Reuse the existing card styling (rounded, teal border, centered text), centered within the page with `max-w-md` so it sits as a clear call-to-action panel rather than a blocking modal.
- No changes to data fetching, claim logic, or other components.

## Out of scope
- The separate `UnverifiedOverlay` component used elsewhere (directory cards) — unchanged.
- Verified business layout — unchanged.
