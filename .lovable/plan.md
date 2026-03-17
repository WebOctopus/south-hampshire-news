

## GoCardless Payment Gateway — Diagnosis and Fixes

### What the system data shows

I examined the edge function logs, database records, and code flow. Here's what's happening:

**Recent activity (today, 09:59 UTC):**
- A mandate redirect flow was created successfully for booking `5a10f690` (£426 fixed campaign)
- GoCardless webhook received `billing_requests` events (flow_created, created, flow_visited) — the customer visited the GoCardless page
- The webhook handler logs `Unhandled resource type: billing_requests` for all three events — they're being dropped

**Database state:**
- All 6 mandates in the DB are from October 2025 (test data with `MD_TEST_` prefixes)
- Multiple March 2026 bookings have GoCardless redirect flow IDs in their `notes` field but remain at `payment_status: 'pending'` — meaning customers were redirected to GoCardless but the return flow failed
- Zero subscriptions have ever been recorded
- No new payments since October 2025

### Root causes identified

**Bug 1 — Critical: `PaymentSetup.tsx` premature "paid" update (line 106-110)**
Lines 106-110 run OUTSIDE the `if (redirectFlowId)` block due to incorrect indentation/scoping. This means:
- If the user lands on `/payment-setup?booking_id=X` without a `redirect_flow_id`, the booking is immediately marked as `payment_status: 'paid'` and `status: 'submitted'` — without any payment actually being processed
- Even when the redirect flow IS present, the booking is marked 'paid' before GoCardless confirms the payment (the webhook should do this)

**Bug 2 — Webhook doesn't handle `billing_requests` resource type**
GoCardless now sends `billing_requests` events as part of their Billing Request API flow. The webhook only handles `mandates`, `payments`, and `subscriptions`. The `billing_requests` events are logged as unhandled and dropped. This isn't necessarily causing failures but means status tracking is incomplete.

**Bug 3 — No error handling for customer address fallback**
In `BookingDetailsDialog.tsx` line 186-189, the address fields fall back to placeholder strings like `'Address pending'` and `'POSTCODE'`. GoCardless may reject these as invalid, causing the redirect flow creation to fail for bookings that don't have address data stored in selections.

### Planned fixes

**1. Fix `PaymentSetup.tsx` scoping bug**
Move lines 106-165 (the "paid" update, voucher generation, success state, and redirect) inside the `if (redirectFlowId)` block. Add an `else` branch that shows an error message when no redirect_flow_id is present (user hit the page incorrectly).

**2. Remove premature "paid" status**
After the redirect flow completes and payment/subscription is created, set status to `payment_pending` or `subscription_pending` instead of `paid`. Let the GoCardless webhook handler set `paid` when payment is actually confirmed.

**3. Add `billing_requests` handling to webhook**
Add a basic handler for `billing_requests` events in the webhook to log them properly and potentially update booking metadata. At minimum, handle `fulfilled` action to know when the customer completed the flow.

**4. Improve error handling in `BookingDetailsDialog`**
Add validation before initiating payment: check that required address fields exist in `booking.selections` and show a toast asking the user to update their address if missing, rather than sending invalid data to GoCardless.

**5. Add retry/status feedback**
When a booking already has a redirect flow but payment_status is still 'pending', show a "Resume Payment" option in the booking details dialog instead of creating a new redirect flow.

### Files to change

- `src/pages/PaymentSetup.tsx` — Fix scoping bug, remove premature paid status
- `supabase/functions/gocardless-webhook/index.ts` — Add billing_requests handler
- `src/components/dashboard/BookingDetailsDialog.tsx` — Add address validation, resume payment option

