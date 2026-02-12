

## Fix: Campaign Duration validation checking wrong step index

### Root Cause
The validation in `handleStepTransition` checks `currentStep === 2`, but `AreaAndScheduleStep` is actually the **second child** of `StepForm` (index 1, zero-based):

- Step 0: `PricingOptionsStep`
- Step 1: `AreaAndScheduleStep` (has Campaign Duration)
- Step 2: `AdvertisementSizeStep` / `LeafletSizeStep`
- Step 3+: remaining steps

The comment even says "Step 2 is AreaAndScheduleStep (index 2 in the form)" but that's incorrect -- it's index 1. So validation never fires because when the user is on AreaAndScheduleStep (`currentStep === 1`), the code is looking for `currentStep === 2`.

### Fix

**File:** `src/components/AdvertisingStepForm.tsx` (line 257)

Change:
```typescript
if (currentStep === 2) {
```
To:
```typescript
if (currentStep === 1) {
```

And update the comment on line 256 accordingly.

One line change. This will make the Campaign Duration validation actually fire when users try to leave the Area & Schedule step.

