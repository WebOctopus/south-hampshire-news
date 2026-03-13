

## Fix: Dashboard CreateBookingForm pricing parity with front-end calculator

### Problem
The dashboard's `CreateBookingForm` calls `calculateAdvertisingPrice` with an **empty array `[]` for `volumeDiscounts`** (line 170), while the front-end calculator (`Advertising.tsx` line 230) passes the actual `volumeDiscounts` data from `usePricingData()`. The dashboard also doesn't destructure `volumeDiscounts` from the hook at all.

This means any volume discount tiers configured in the database are ignored in the dashboard form, causing price discrepancies when multiple areas are selected.

Additionally, the front-end passes the `relevantDurations` (filtered by model type) as the `durations` parameter, while the dashboard always passes the full `durations` array regardless of model. This could cause incorrect duration lookups.

### Changes (1 file)

**`src/components/dashboard/CreateBookingForm.tsx`**:

1. **Line 76**: Add `volumeDiscounts` to the destructured values from `usePricingData()`.

2. **Lines 161-173**: Update the `calculateAdvertisingPrice` call to:
   - Pass the correct `relevantDurations` (fixed durations for fixed model, subscription durations for BOGOF) instead of always passing `durations`.
   - Pass actual `volumeDiscounts` instead of `[]`.

This makes the dashboard call signature identical to `Advertising.tsx`:
```typescript
const relevantDurations = pricingModel === 'bogof' 
  ? subscriptionDurations : durations;

return calculateAdvertisingPrice(
  areasToUse,
  selectedAdSize,
  selectedDuration,
  pricingModel === 'bogof',
  areas || [],
  adSizes || [],
  relevantDurations || [],
  subscriptionDurations || [],
  volumeDiscounts || [],  // was: []
  pricingModel === 'bogof' ? bogofFreeAreas : [],
  0
);
```

No UI/UX changes. Same form layout and behavior, just correct pricing math.

