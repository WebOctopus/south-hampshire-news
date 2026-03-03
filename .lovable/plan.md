

## Bug: Leaflet areas pulling wrong schedule (magazine schedule instead of their own)

### Root Cause

In `src/components/AreaAndScheduleStep.tsx`, lines 109-122, there is code that **intentionally overrides** each leaflet area's schedule with the corresponding magazine area's schedule:

```typescript
// For leafleting, use leaflet areas but with schedule from magazine areas
const leafletAreasWithMagazineSchedule = (leafletAreas || []).map(leafletArea => {
  const magazineArea = areas?.find(a => 
    a.name.toLowerCase().includes(leafletArea.name.toLowerCase()) || ...
  ) || areas?.[0];
  
  return {
    ...leafletArea,
    schedule: magazineArea?.schedule || leafletArea.schedule || []
  };
});
```

This means leaflet Area 2 (Chandler's Ford, which has a March/May/July schedule in the `leaflet_areas` table) gets overwritten with the magazine area's schedule (April/June/August from `pricing_areas`). The comment says "This ensures leaflets follow the same publication schedule as magazines" — but that is incorrect; leaflets have their own independent schedule stored in the database.

### Fix

In `src/components/AreaAndScheduleStep.tsx`, change `getEffectiveData()` for the leafleting case to simply use the leaflet areas as-is with their own schedules:

```typescript
if (pricingModel === 'leafleting') {
  return {
    areas: (leafletAreas || []).map(a => ({
      ...a,
      schedule: a.schedule || []
    })),
    isLoading: leafletAreasLoading,
    isError: !!leafletAreasError
  };
}
```

This removes the magazine schedule override and uses each leaflet area's own schedule data from the `leaflet_areas` table.

### Also fix nested Label tag

Line 160 of `LeafletBasketSummary.tsx` has a nested `<Label>` from the previous edit — will fix that too.

### Files Changed

| File | Change |
|---|---|
| `src/components/AreaAndScheduleStep.tsx` | Lines 108-128: Remove magazine schedule override for leafleting areas |
| `src/components/LeafletBasketSummary.tsx` | Line 160: Fix nested `<Label>` tag |

