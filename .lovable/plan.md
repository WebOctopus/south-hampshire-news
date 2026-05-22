# Add Discover favicon to verified business cards

Replace the small green "D" circle badge on `VerifiedBusinessCard` with the Discover site favicon (`/favicon.svg`, falling back to `/favicon.png`) so it visually represents that the business advertises in Discover.

## Changes

- `src/components/directory/VerifiedBusinessCard.tsx`
  - When `business.advertises_in_discover` is true, render an `<img src="/favicon.svg">` (≈28px, rounded) below the business logo in place of the current "D" letter badge.
  - Keep the existing tooltip text ("Advertises in Discover") via the `title` attribute and `alt` text for accessibility.
  - Preserve current layout (centered under the logo) so card structure is unchanged.

No other components or business logic touched.
# Double the hero logo tile size

Change `BusinessDetailHero.tsx` so the `BusinessIcon` size prop goes from `80` to `160` (double). Keep the rounded-2xl tile styling and existing layout — the hero row already flex-wraps, so the larger logo will sit beside the heading on desktop and stack above on mobile.

No other components change. `BusinessIcon` already requests a 256px favicon and uses `object-contain`, so it will render crisply at the larger size.
