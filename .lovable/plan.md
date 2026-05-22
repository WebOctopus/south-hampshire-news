## Move Discover favicon to footer only on verified cards

In `src/components/directory/VerifiedBusinessCard.tsx`:

- Remove the Discover favicon currently rendered under the business logo (top-left of the card).
- Keep the favicon already in the footer row, immediately before the category tag (in line with the "View" link on the right).

The footer favicon (added in the previous change) already renders when `advertises_in_discover` is true — no other change needed.
