

## Fix: Campaign Duration validation is never executed

### Root Cause

The `handleStepTransition` function (line 255) contains all the Campaign Duration validation logic, but it is **never actually used**. Instead, the `stepLabels` object (line 943) defines its own inline `onStepTransition` handler that completely bypasses `handleStepTransition`:

```
stepLabels.onStepTransition (line 947)  <-- This is what StepForm calls
    |
    +--> Only checks BOGOF dialog at step 3
    +--> Calls nextStep() directly for everything else
    +--> NEVER calls handleStepTransition()

handleStepTransition (line 255)  <-- This has the validation, but is ORPHANED
    |
    +--> Checks Campaign Duration at step 1
    +--> Shows toast + scrolls to section
    +--> Never gets called by anything
```

### Fix

Merge the Campaign Duration validation from `handleStepTransition` into the actual `onStepTransition` handler inside `stepLabels` (line 947-956). This way both the Campaign Duration check (step 1) and the BOGOF dialog check (step 3) live in the same function that StepForm actually calls.

### Changes

**File: `src/components/AdvertisingStepForm.tsx`**

Update the `onStepTransition` inside `stepLabels` (lines 947-956) to:

1. Add Campaign Duration validation when `currentStep === 1` (leaving the Area and Schedule step)
2. For `fixed` and `leafleting` models: check that `campaignData.selectedDuration` is set; if not, show the error toast, scroll to the duration section, and return without calling `nextStep()`
3. Keep the existing BOGOF dialog check at step 3
4. Remove or mark the orphaned `handleStepTransition` function (lines 255-314) since its logic will now live in `stepLabels.onStepTransition`

The updated `onStepTransition` will look like:

```typescript
onStepTransition: (currentStep: number, nextStep: () => void) => {
  // Step 1: Validate Campaign Duration before leaving Area & Schedule
  if (currentStep === 1) {
    if (selectedPricingModel === 'leafleting' || selectedPricingModel === 'fixed') {
      if (!campaignData.selectedDuration) {
        toast({
          title: "Campaign Duration Required",
          description: "Please select a campaign duration before continuing.",
          variant: "destructive",
        });
        document.getElementById('campaign-duration-section')?.scrollIntoView({ 
          behavior: 'smooth', block: 'center' 
        });
        return; // Block navigation
      }
    }
  }

  // Step 3: BOGOF/FreePlus dialog for Fixed Term with 3+ areas
  if (currentStep === 3 && selectedPricingModel === 'fixed' 
      && (campaignData.selectedAreas?.length || 0) >= 3 
      && campaignData.selectedAdSize) {
    setPendingNextStep(() => nextStep);
    setShowFixedTermConfirmation(true);
    return;
  }

  nextStep(); // Proceed normally
}
```

This is the only change needed. The validation, toast, and scroll-to-section logic all remain the same -- they just need to be in the right place.

