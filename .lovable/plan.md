

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

---

## Fixed Term Pricing & Stripe Integration — Completed

### Issues Fixed

**1. Pricing fallback bug**
- Fixed `calculateAdvertisingPrice()` to use `base_price_per_area` (not `base_price_per_month`) when `fixed_pricing_per_issue` is empty
- This ensures Fixed Term ad sizes show the correct price (e.g., £1.00 instead of £0.80)

**2. Stripe integration for Fixed Term payments**
- Created `create-stripe-checkout` edge function for one-off card payments
- Created `stripe-webhook` edge function to handle `checkout.session.completed` events
- Fixed Term bookings now show "Pay Full Amount by Card" button instead of GoCardless options
- GoCardless flow preserved for 3+ Repeat (bogof) bookings only

**3. Payment UI conditional logic**
- BookingDetailsDialog detects `pricing_model === 'fixed'` and shows Stripe checkout
- All GoCardless-specific text/options hidden for Fixed Term
- Secure payment info text updated to reference Stripe for Fixed Term

### Files Changed

| File | Change |
|---|---|
| `src/lib/pricingCalculator.ts` | Fixed fallback from `base_price_per_month` to `base_price_per_area` |
| `src/components/dashboard/BookingDetailsDialog.tsx` | Conditional Stripe vs GoCardless payment UI |
| `src/pages/PaymentSetup.tsx` | Added Stripe success handling alongside GoCardless |
| `supabase/functions/create-stripe-checkout/index.ts` | New: Stripe Checkout Session creation |
| `supabase/functions/stripe-webhook/index.ts` | New: Stripe webhook handler |
| `supabase/config.toml` | Added Stripe function configs |
