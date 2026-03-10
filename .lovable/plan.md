

## Trim Free Bonus Areas When Paid Areas Are Deselected

### Problem
When a user deselects a paid area, the free bonus areas remain unchanged. This can result in more free areas than paid areas, which should never happen.

### Fix

**File: `src/components/AreaAndScheduleStep.tsx`** (lines 191-193)

In the `handleBogofPaidAreaChange` function, after computing `newPaidAreas` on deselect, trim `newFreeAreas` to never exceed `newPaidAreas.length`:

```typescript
} else {
  newPaidAreas = bogofPaidAreas.filter(id => id !== areaId);
  newFreeAreas = bogofFreeAreas.slice(0, newPaidAreas.length);
}
```

This trims from the end — the most recently added free areas get removed first. Single line change, no new dependencies.

