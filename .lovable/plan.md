

## Fix: Grey "Pay in Full by Card" Button Not Redirecting to Stripe

### Problem
The "Pay Full Amount by Card" button appears greyed out (disabled) because the `legalDocumentsAccepted` state is `false`. Even though we added a `useEffect` to sync with `booking.terms_accepted_at`, the button disable condition `!legalDocumentsAccepted` may still evaluate to `true` in edge cases (e.g., stale state, re-renders where the effect hasn't fired yet).

### Root Cause
The button's `disabled` prop relies solely on `legalDocumentsAccepted` state, which can fall out of sync with the actual `terms_accepted_at` value on the booking.

### Fix
**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

Update the button's `disabled` condition on line 813 to also check `booking.terms_accepted_at` directly, making it impossible for the button to be disabled when terms are already recorded:

```tsx
// Before (line 813):
disabled={!legalDocumentsAccepted || stripeLoading}

// After:
disabled={(!legalDocumentsAccepted && !booking?.terms_accepted_at) || stripeLoading}
```

Apply the same fix to the GoCardless "Set Up Payment Plan" button on line 976:

```tsx
// Before:
disabled={!selectedPaymentOption || !legalDocumentsAccepted || createMandate.isPending}

// After:
disabled={!selectedPaymentOption || (!legalDocumentsAccepted && !booking?.terms_accepted_at) || createMandate.isPending}
```

### Why This Works
- If `terms_accepted_at` is set on the booking (from quote acceptance), the button is enabled regardless of `legalDocumentsAccepted` state
- If `terms_accepted_at` is null, the checkbox must still be checked (existing behaviour)
- This is a belt-and-suspenders approach alongside the existing `useEffect`

### Files Changed
- `src/components/dashboard/BookingDetailsDialog.tsx` — two line changes to button `disabled` conditions

