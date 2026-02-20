
## Fix: "Contact Information" Button Bypasses Mandatory Payment Option

### The Problem

On the basket/summary page (Step 4 of 5), the top-right "Contact Information →" button navigates directly to the contact details step **without requiring a payment option to be selected**. This bypasses the whole purpose of the payment selection screen.

The root cause is in `AdvertisingStepForm.tsx`. The `onStepTransition` handler validates step 1 (area/schedule) and step 3 (fixed term dialog), but has **no validation at step 3 (index) — the basket summary step**:

```typescript
// currentStep 3 = basket summary (0-indexed)
// Currently: no check → calls nextStep() freely
// Fix needed: block if !campaignData.selectedPaymentOption
```

The "Save Quote" and "Book Now" buttons **inside** the `BookingSummaryStep` component do check `disabled={!selectedPaymentOption}`, but the top-right StepForm navigation button completely ignores this.

### Two Changes to Make

---

#### Change 1: Add payment validation to `onStepTransition` for step index 3

In `src/components/AdvertisingStepForm.tsx`, inside the `onStepTransition` handler, add a check **before** the final `nextStep()` call:

```typescript
// Step 3 (0-indexed) = Basket Summary step — payment option must be selected
if (currentStep === 3 && (selectedPricingModel === 'bogof' || selectedPricingModel === 'leafleting')) {
  if (!campaignData.selectedPaymentOption) {
    toast({
      title: "Payment Option Required",
      description: "Please select a payment option before continuing.",
      variant: "destructive",
    });
    return;
  }
}
```

Note: For `fixed` pricing model, `currentStep === 3` is already intercepted by the BOGOF/FreePlus dialog check (`if (currentStep === 3 && selectedPricingModel === 'fixed' ...)`). That dialog then calls `nextStep()` via `handleContinueWithFixedTerm` — so we also need to add the payment check inside that dialog handler, or before it.

The cleanest approach: add a **single early-exit payment check at `currentStep === 3` for ALL pricing models** before the fixed-term dialog check:

```typescript
// Step 3: Payment option must always be selected (for bogof/leafleting)
// For fixed, it will also need this but fixed goes through FixedTermBasketSummary which has no payment options
```

Wait — actually **fixed term uses `FixedTermBasketSummary`** which has no payment options at all (it's a different, simplified summary with no payment selection). So the validation should only apply for `bogof` and `leafleting`.

**Final logic:**

```typescript
onStepTransition: (currentStep: number, nextStep: () => void) => {
  // ... existing step 1 validations ...

  // Step 3: Payment option required for bogof and leafleting
  if (currentStep === 3 && selectedPricingModel !== 'fixed') {
    if (!campaignData.selectedPaymentOption) {
      toast({
        title: "Payment Option Required",
        description: "Please select a payment option to continue.",
        variant: "destructive",
      });
      return; // Block navigation
    }
  }

  // Step 3: BOGOF/FreePlus dialog for Fixed Term with 3+ areas (existing)
  if (currentStep === 3 && selectedPricingModel === 'fixed' && ...) {
    // existing dialog logic
  }

  nextStep();
}
```

---

#### Change 2: Remove the "Contact Information" button label ambiguity (optional UX improvement)

The button label "Contact Information" at the top-right is confusing — it implies you click it to provide contact info, bypassing the payment selection. Since the basket summary already has "Save Quote" and "Book Now" buttons with proper validation, the top-right "Contact Information" button is redundant and misleading.

**Two options for this:**

**Option A (preferred):** Keep the button but rename it to something like `"Next: Contact Details →"` so it's clearer it's a step-forward action, and it will now be blocked by the payment validation above.

**Option B:** Hide the top-right next button specifically on step 4 (the basket summary), since the inline buttons serve this purpose better.

We'll go with **Option A** — rename the label and enforce the payment validation gate. This is the least disruptive change and keeps consistent navigation UX.

The `nextButtonLabels` array at index 3 currently reads `'Contact Information'`. We'll change it to `'Next: Contact Details'` to make it clearer it's a navigation action rather than a section label.

---

### Files Changed

| File | Change |
|---|---|
| `src/components/AdvertisingStepForm.tsx` | Add payment option validation at `currentStep === 3` in `onStepTransition`; optionally rename label |

No database changes. No edge function changes. Single file edit.

### Step Index Reference

| StepForm 0-indexed | Step Label | Pricing models |
|---|---|---|
| 0 | Pricing Options | all |
| 1 | Area & Schedule | all |
| 2 | Ad Size / Design | all |
| 3 | **Basket Summary** | bogof → BookingSummaryStep; fixed → FixedTermBasketSummary; leafleting → LeafletBasketSummary |
| 4 | Contact Information | all |

The validation fires when the user tries to leave step index 3 (basket summary). For `bogof` and `leafleting` it will block if no payment option is selected.
