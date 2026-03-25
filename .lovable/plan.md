

## Fix: GoCardless Payment Failing for 3+ (BOGOF) Bookings

### Root Cause

Two bugs in `src/pages/PaymentSetup.tsx`:

1. **Wrong subscription detection (line 115)**: The code checks `paymentOption.option_type === 'direct_debit'` to decide if it's a subscription. But the actual option_type values in the database are `monthly` and `12_months_full` — there is no `direct_debit` type. So the monthly payment plan is always incorrectly sent as a **one-off** payment to GoCardless, which fails because GoCardless tries to collect the full amount immediately instead of setting up recurring payments.

2. **Wrong amount sent (line 122)**: The code sends `booking.final_total` as the payment amount. For BOGOF monthly subscriptions, this should be the **per-month** amount (monthly_price x number of paid areas), not the total campaign cost.

### PAYG Status
Pay As You Go uses **Stripe** (not GoCardless), so it was never affected by the previous fix. PAYG payments should be working correctly.

### Fix

**File: `src/pages/PaymentSetup.tsx`** (lines 114-125)

Change:
```tsx
const isSubscription = paymentOption.option_type === 'direct_debit';

const { error: paymentError } = await supabase.functions.invoke('create-gocardless-payment', {
  body: {
    bookingId,
    mandateId,
    paymentType: isSubscription ? 'subscription' : 'one-off',
    amount: booking.final_total,
    paymentOptionId: paymentOption.id,
  },
});
```

To:
```tsx
const isSubscription = paymentOption.option_type === 'monthly';

// For monthly subscriptions, calculate per-month amount
let paymentAmount = booking.final_total;
if (isSubscription && booking.pricing_model === 'bogof') {
  const paidAreaCount = (booking.bogof_paid_area_ids || []).length || 1;
  paymentAmount = (booking.monthly_price || 0) * paidAreaCount;
}

const { error: paymentError } = await supabase.functions.invoke('create-gocardless-payment', {
  body: {
    bookingId,
    mandateId,
    paymentType: isSubscription ? 'subscription' : 'one-off',
    amount: paymentAmount,
    paymentOptionId: paymentOption.id,
  },
});
```

### Files to change
- `src/pages/PaymentSetup.tsx` — fix subscription detection and amount calculation

