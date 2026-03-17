

## Fix Fixed Term Pricing & Enable Stripe for Fixed Term Payments

### Issues Found

**1. Pricing fallback bug** — The `DUMMY £` ad size has empty `fixed_pricing_per_issue: {}`. In `calculateAdvertisingPrice()`, the fallback for fixed pricing uses `base_price_per_month` (£0.80, the subscription price) instead of `base_price_per_area` (£1.00, the fixed price). This is why £0.80 shows instead of £1.00.

**2. Wrong payment method** — Fixed Term bookings currently show GoCardless Direct Debit options (monthly plan, 12 months in advance) in the BookingDetailsDialog. Fixed Term should offer a single "Pay Full Amount" option via Stripe.

**3. Wrong labels** — The grey strip says "Make Payment by GoCardless" and "Secure Payment: Your payment will be processed by GoCardless" for Fixed Term, which is incorrect.

---

### Plan

**Step 1: Fix pricing fallback** (`src/lib/pricingCalculator.ts`)
- For the `else` (fixed) branch: change fallback from `base_price_per_month` to `base_price_per_area` when `fixed_pricing_per_issue` is empty.

**Step 2: Enable Stripe**
- Use the Stripe enable tool, which will guide through secret key setup and expose Stripe-specific tools and patterns.

**Step 3: Create Stripe checkout edge function** (`supabase/functions/create-stripe-checkout/index.ts`)
- Accepts booking ID, amount, and customer email.
- Creates a Stripe Checkout Session for a one-off payment.
- Returns the checkout URL for redirect.

**Step 4: Update BookingDetailsDialog** (`src/components/dashboard/BookingDetailsDialog.tsx`)
- Detect `booking.pricing_model === 'fixed'` (and potentially `'leafleting'`).
- For fixed bookings: hide the GoCardless payment options radio group entirely.
- Show a single "Pay Full Amount by Card" button that triggers the Stripe checkout edge function.
- Update the secure payment text to reference Stripe instead of GoCardless.
- Keep GoCardless flow for `bogof` bookings only.

**Step 5: Update FixedTermBasketSummary** (`src/components/FixedTermBasketSummary.tsx`)
- Remove the GoCardless payment option selector (already not shown, but ensure no payment_option_id is required for Fixed Term).

**Step 6: Handle Stripe success** (`src/pages/PaymentSetup.tsx` or new callback page)
- After Stripe redirects back, update the booking status to `payment_pending` or `paid`.

**Step 7: Stripe webhook** (`supabase/functions/stripe-webhook/index.ts`)
- Listen for `checkout.session.completed` events.
- Update booking `payment_status` to `paid` when confirmed.

---

### Files to Change
1. `src/lib/pricingCalculator.ts` — Fix fallback pricing for fixed term
2. New: `supabase/functions/create-stripe-checkout/index.ts` — Stripe Checkout Session creation
3. New: `supabase/functions/stripe-webhook/index.ts` — Handle Stripe payment confirmations
4. `src/components/dashboard/BookingDetailsDialog.tsx` — Conditional Stripe vs GoCardless UI
5. `src/pages/PaymentSetup.tsx` — Handle Stripe return URL
6. `supabase/config.toml` — Add Stripe function config

