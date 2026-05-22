# Make Discover favicon more visible on verified business cards

The favicon was already added under the logo on `VerifiedBusinessCard`, but it only renders when `advertises_in_discover` is true — so on cards where that flag is false it doesn't appear. The user wants it more prominently shown on cards in the "Verified businesses" row to indicate the business advertises in Discover.

## Changes

`src/components/directory/VerifiedBusinessCard.tsx`

- Keep the existing favicon under the business logo (top-left of the card).
- Additionally, in the footer row (where the category tag sits), render the Discover favicon (≈18px) immediately before the category tag when `advertises_in_discover` is true, with tooltip/alt "Advertises in Discover".
- No styling changes elsewhere; the footer remains a flex row with the favicon + tag on the left and the "View" link on the right.

Only `advertises_in_discover === true` triggers the icon — businesses that don't advertise in Discover won't show it.
# Double the hero logo tile size

Change `BusinessDetailHero.tsx` so the `BusinessIcon` size prop goes from `80` to `160` (double). Keep the rounded-2xl tile styling and existing layout — the hero row already flex-wraps, so the larger logo will sit beside the heading on desktop and stack above on mobile.

No other components change. `BusinessIcon` already requests a 256px favicon and uses `object-contain`, so it will render crisply at the larger size.
