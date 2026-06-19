## Goal

Move the `record_discount_redemption` call out of the browser and into the post-payment server flow, so a code is only consumed after payment is actually confirmed. Use the service role from inside the edge functions (the RPC is locked to service role).

## Where the redemption gets called

Two confirmation paths exist; both will record the redemption:

1. **Stripe path** — `supabase/functions/stripe-webhook/index.ts`, inside the `checkout.session.completed` branch, *after* the booking is updated to `payment_status: 'paid'` / `status: 'confirmed'`.
2. **GoCardless path** — `supabase/functions/create-gocardless-payment/index.ts`, *after* the subscription (DD) or one-off payment is successfully created at GoCardless, the row is inserted into `gocardless_subscriptions` / `gocardless_payments`, and the booking's `payment_status` is updated to `subscription_pending` / `payment_pending`. This is the user-requested "subscription/payment setup" trigger — at that point the customer has authorised the mandate and the schedule is committed, so the code should be consumed.

Both functions already build a service-role Supabase client (`SUPABASE_SERVICE_ROLE_KEY`); the new RPC call reuses it.

## Shared helper

Add `supabase/functions/_shared/recordDiscountRedemption.ts` exporting `recordDiscountRedemptionForBooking(supabase, bookingId)` that:

1. Selects `user_id`, `email`, `final_total`, `pricing_breakdown`, `selections` from `bookings` by id.
2. Reads the discount block written by the checkout flow — first `pricing_breakdown.discount`, falling back to `selections.discount`. Block shape (already persisted by `AdvertisingStepForm`): `{ code, code_id, discount_type, discount_value, free_item_text, discount_amount, product_type }`.
3. If no discount block → return silently.
4. Derives `p_booking_value` = `pricing_breakdown.rawFinalTotal` if present, else `bookings.final_total + discount.discount_amount` (final_total on the row is already discounted). This matches the user's requirement that `p_booking_value` is the pre-discount total.
5. Calls `supabase.rpc('record_discount_redemption', { p_code, p_user_id, p_email, p_booking_id, p_product_type, p_booking_value, p_discount_amount, p_free_item_text })`.
6. **Idempotency**: before inserting, checks `discount_code_redemptions` for an existing row with `booking_id = p_booking_id` and returns early if found. This protects against Stripe webhook re-deliveries and any double-fire across the two paths.
7. Wrapped in try/catch with `console.error` — failure must never break the webhook response (booking confirmation has already happened).

## Edits

- `supabase/functions/stripe-webhook/index.ts` — after the successful booking update, `await recordDiscountRedemptionForBooking(supabase, bookingId)`.
- `supabase/functions/create-gocardless-payment/index.ts` — at the end of both the subscription branch and the one-off payment branch (after the booking `payment_status` update), call the same helper with the existing `bookingId`.
- `src/components/AdvertisingStepForm.tsx` — remove the client-side `supabase.rpc('record_discount_redemption', …)` block (lines ~1006–1023). Keep the discount metadata being persisted into `pricing_breakdown.discount` / `selections.discount` exactly as today; that is what the edge function reads.

## Out of scope

- `validate_discount_code` RPC and `discount_codes` schema — unchanged.
- `gocardless-webhook` — does not need to record again; the redemption is already recorded at subscription/payment setup as the user specified.
- Stripe webhook signature handling, GoCardless flow logic, invoice generation — unchanged.

## Technical notes

- `record_discount_redemption` is `SECURITY DEFINER` but its `GRANT EXECUTE` is restricted to `service_role`. Both target functions already use `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`, so calling `.rpc(...)` from them satisfies that grant. The anon-key client is never used for this RPC.
- The helper's pre-check on `discount_code_redemptions(booking_id)` makes repeated webhook deliveries safe without needing a DB unique constraint change.
