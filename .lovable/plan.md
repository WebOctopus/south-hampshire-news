

## Fix: "Payment option not found" on GoCardless Return

### Root Cause
`PaymentSetup.tsx` stores the payment option's `option_type` (e.g. `"monthly"`) in `booking.selections.payment_option_id`, but then queries the `payment_options` table using `.eq('id', ...)` — treating the option_type string as a UUID. This always fails.

### Fix

**File: `src/pages/PaymentSetup.tsx`** (lines 73-77)

Change the query from:
```tsx
const { data: paymentOption } = await supabase
  .from('payment_options')
  .select('*')
  .eq('id', paymentOptionId)
  .single();
```

To:
```tsx
const { data: paymentOption } = await supabase
  .from('payment_options')
  .select('*')
  .eq('option_type', paymentOptionId)
  .single();
```

This matches how `BookingDetailsDialog.tsx` stores the value (`option_type` string) and how it reads it back everywhere else.

### Files to change
- `src/pages/PaymentSetup.tsx` — fix `.eq('id', ...)` → `.eq('option_type', ...)`

