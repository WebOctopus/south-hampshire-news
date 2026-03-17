

## GoCardless Payment Gateway Fixes — Completed

### Fixes Applied

**1. PaymentSetup.tsx — Scoping bug fixed (Critical)**
- Lines 106-165 were running OUTSIDE the `if (redirectFlowId)` block, causing bookings to be marked as "paid" without any payment
- All post-payment logic (status update, voucher generation, success redirect) now correctly scoped inside the redirect flow block
- Added `else` branch showing error when no redirect_flow_id is present
- Changed premature `payment_status: 'paid'` to `payment_status: 'payment_pending'` — the webhook will set final "paid" status

**2. GoCardless webhook — billing_requests handler added**
- Added `handleBillingRequestEvent()` to handle `billing_requests` resource type events
- Logs fulfilled, failed, and cancelled actions for debugging
- No longer drops these events as "unhandled"

**3. BookingDetailsDialog — Address validation added**
- Validates address, city, and postcode before initiating GoCardless redirect
- Shows toast error if address fields are missing or contain placeholders
- Prevents invalid data from being sent to GoCardless API

### Files Changed

| File | Change |
|---|---|
| `src/pages/PaymentSetup.tsx` | Fixed scoping bug, changed to payment_pending status |
| `supabase/functions/gocardless-webhook/index.ts` | Added billing_requests handler |
| `src/components/dashboard/BookingDetailsDialog.tsx` | Added address validation before payment |
