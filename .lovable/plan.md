## Problem

Three bugs in the GoCardless checkout / booking conversion:

1. **PaymentSetup** multiplies `monthly_price` by paid-area count when sending the subscription amount to GoCardless (`£129 × 3 = £387`). `monthly_price` already represents the all-areas monthly DD amount.
2. **`bookings.final_total`** is copied from quote/calculator as `subtotal × durationMultiplier`, producing 2× the correct total (e.g. `£1,548` instead of `£774`). The intended total for a 6-month subscription is `monthly_price × 6`.
3. **`create-gocardless-payment`** trusts the client-sent `amount` and uses the user-scoped Supabase client for inserts into `gocardless_subscriptions` / `gocardless_payments` / `gocardless_customers` and the `bookings` update — these inserts silently fail because there are no INSERT RLS policies for `authenticated`.

Quote display (£129/mo, £774) is correct and must not change.

## Fix

### 1. `src/pages/PaymentSetup.tsx` (lines ~115–122)
Remove the `paidAreaCount` multiplication. For subscriptions, send `booking.monthly_price` directly:
```ts
const paymentAmount = isSubscription
  ? (booking.monthly_price || 0)
  : booking.final_total;
```

### 2. Correct stored `bookings.final_total` for subscription bookings
At every booking write site, set `final_total = monthly_price × 6` (use `paymentOptions.monthly.minimum_payments` where available, default 6) for `pricing_model` `bogof` and subscription `fixed`. Leafleting/one-off totals untouched.

Sites to update:
- `src/pages/Dashboard.tsx` `handleTermsConfirm` (~L738): override `final_total` before insert.
- `src/components/dashboard/CreateBookingForm.tsx` booking-insert paths (~L259, L311, L348, L401): same override (keep quote rows untouched so display stays correct).

`monthly_price` calculation in `CreateBookingForm` is unchanged (it already yields the correct £129).

### 3. `supabase/functions/create-gocardless-payment/index.ts`
- Add a service-role client (`SUPABASE_SERVICE_ROLE_KEY`) alongside the auth-scoped client.
- For `paymentType === 'subscription'`, fetch the booking server-side and use `booking.monthly_price` as the GoCardless `amount`; ignore the client-provided `amount`. Validate ownership (`booking.user_id === user.id`).
- Switch the inserts into `gocardless_subscriptions` / `gocardless_payments` and the `bookings.payment_status` update to the service-role client.
- Check `.error` on every insert/update and `throw` with a logged message so failures surface to the caller instead of being swallowed.
- Apply the same service-role + error-throw pattern to the `gocardless_customers` insert if/where present in `complete-gocardless-redirect` is out of scope unless it lives in this function (it does not — leave untouched).

## Out of scope
- Quote pricing display / `pricingCalculator.ts` finalTotal math.
- `complete-gocardless-redirect` and `gocardless-webhook` logic.
- One-off (non-subscription) payment amount calculation.
- Adding RLS INSERT policies (we move to service role instead, per instructions).
