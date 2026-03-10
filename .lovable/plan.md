

## Always Show FREE Bonus Areas Section

### Change

In `src/components/AreaAndScheduleStep.tsx` (lines 664-742), remove the `{bogofPaidAreas.length > 0 && (` conditional wrapper so the FREE Bonus Areas heading, badge, and description are always visible. Instead, conditionally render the area cards: show them only when `bogofPaidAreas.length > 0`, otherwise display a muted hint like "Select at least one paid area to unlock your free bonus areas."

### File: `src/components/AreaAndScheduleStep.tsx`

- **Line 664**: Remove the `{bogofPaidAreas.length > 0 && (` guard
- **Line 742**: Remove the matching closing `)}`
- **Lines 694-740** (the area cards grid): Wrap in `{bogofPaidAreas.length > 0 ? (...cards...) : (<p className="text-sm text-muted-foreground italic">Select at least one paid area to unlock your free bonus areas.</p>)}`

Single file change, no new dependencies.

