## Hide Competition Entry Count

Remove the visible "X entries" indicator from each competition card on the Competitions page so visitors can't see how many people have entered.

### Change
- **`src/pages/Competitions.tsx`** (lines 189–192): Remove the `<div>` containing the `Users` icon and `{competition.entry_count} entries` text.
- The prize block on the left will remain; admin-side entry counts are unaffected.