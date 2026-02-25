

## Fix: Leafleting "Book Now" Blocked by Payment Option Validation

### Problem

When users click "Book Now" on the leafleting basket summary, the `onStepTransition` handler in `AdvertisingStepForm.tsx` blocks navigation because it requires a `selectedPaymentOption` for all non-fixed pricing models (line 941: `selectedPricingModel !== 'fixed'`). Leafleting uses fixed 25%/75% payment terms displayed inline — there is no payment option selector, so this field is always empty.

### Fix

In `src/components/AdvertisingStepForm.tsx`, line 941, change the condition from:

```typescript
if (currentStep === 3 && selectedPricingModel !== 'fixed')
```

to:

```typescript
if (currentStep === 3 && selectedPricingModel === 'bogof')
```

This limits the payment option validation to BOGOF only, which is the only non-fixed model that actually has a payment option selector. Leafleting will pass through to the contact information step as expected.

### Files Changed

| File | Change |
|---|---|
| `src/components/AdvertisingStepForm.tsx` | Line 941: change condition to only check `bogof` model |

