

## Plan: Block step navigation until Campaign Duration is selected

### Problem
Users can bypass the Campaign Duration validation by clicking the **step number circles** in the progress indicator. The `goToStep` function navigates directly without running any validation, unlike the "Next Step" button which correctly goes through `onStepTransition`.

### Solution
Add validation to `goToStep` in `StepForm.tsx` so that when navigating **forward** from step 2 (Area & Schedule), it also runs through the `onStepTransition` handler -- which already contains the Campaign Duration validation.

### Changes

**File: `src/components/StepForm.tsx`**

1. **Update `goToStep` function** (line 126-130): When the user clicks a step circle to go **forward** past the current step, run the same `onStepTransition` validation instead of jumping directly. If navigating backward, allow it freely (no validation needed for going back).

```typescript
const goToStep = (step: number) => {
  if (step >= 0 && step < totalSteps) {
    // Going backward is always allowed
    if (step <= currentStep) {
      setCurrentStep(step);
      return;
    }
    // Going forward: validate via onStepTransition if available
    if (stepLabels?.onStepTransition) {
      stepLabels.onStepTransition(currentStep, () => setCurrentStep(step));
    } else {
      setCurrentStep(step);
    }
  }
};
```

This is a single edit to one function. It ensures the existing Campaign Duration validation (with toast + scroll) fires regardless of whether users click "Next Step" or click a future step circle directly.

### Summary

| File | Change |
|------|--------|
| `src/components/StepForm.tsx` | Update `goToStep` to run `onStepTransition` validation when navigating forward (lines 126-130) |

One small edit, no new dependencies.
