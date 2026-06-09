## Problem

The cost-calculator booking flow currently fires **two** webhooks to the Mirola CRM endpoint on final submit:

1. `send-quote-booking-webhook` — sends the correct **flat** payload (email at root, `source: "advertising_calculator"`, `areas[]`, `schedule[]`, etc.) via `buildCrmWebhookPayload` / `webhookPayloadResolver.ts`. This matches the new spec exactly and returns 200.
2. `send-booking-webhook` — sends a legacy **nested** payload (`{ contact: { email }, campaign, configuration, pricing, booking, source }`). Because `email` is not at the top level, the inbound-webhook rejects it with `400 "Email is required"`.

The nested call also produces duplicate records in the CRM logs and marks bookings as `webhook_failed` even when the other call succeeded.

`send-booking-webhook` is also the function that updates the `bookings` row (`webhook_sent_at`, `webhook_response`, `webhook_payload`, `status = 'submitted'`), so we can't just delete it without losing those side-effects.

## Fix

Refactor `supabase/functions/send-booking-webhook/index.ts` so it:

- **Stops POSTing the nested payload** to the inbound webhook (that job is fully covered by `send-quote-booking-webhook`, which already runs immediately after on booking submit and sends the spec-compliant flat JSON).
- **Keeps** the booking-row update logic: write `webhook_sent_at`, set `status = 'submitted'`, and store the flat payload that `send-quote-booking-webhook` will send (for audit/debugging in the `bookings.webhook_payload` column).
- To avoid drift between what is logged on the booking row and what is actually sent, the function will build the same flat shape locally (email + first_name + last_name + phone + company + source + record_type + title + pricing + areas summary) using the data it already receives (`bookingData`, `step1Data`, `step2Data`, `step3Data`). It will NOT post it anywhere — the post is already handled by `send-quote-booking-webhook`.
- Return `{ success: true, bookingId, message: 'Booking saved' }` so the existing client error handling in `AdvertisingStepForm.tsx` continues to work without UI changes.

No client-side changes are required. `AdvertisingStepForm.tsx` will continue to call both functions; only the inbound-webhook POST disappears from `send-booking-webhook`.

## Out of scope

- `send-quote-booking-webhook` — already sends the correct flat payload per the new spec; verified earlier.
- `send-competition-entry-webhook` — uses a different workflow URL (`bd116a69-…`), already updated.
- Frontend payload shape — already correct via `buildCrmWebhookPayload`.
- Removing the `INBOUND_WEBHOOK_API_KEY` header from `send-quote-booking-webhook` is unnecessary; the spec says no key is required but extra headers are ignored.

## Technical detail

File to change: `supabase/functions/send-booking-webhook/index.ts`

- Remove the `fetch(webhookUrl, …)` block and `webhookUrl`/`apiKey` env reads.
- Build a flat `webhookPayload` (root-level `email`, `first_name`, `last_name`, `phone`, `company`, `source: 'advertising_calculator'`, `record_type: 'booking'`, `status`, `title`, `subtotal`, `final_total`, `monthly_price`, plus invoice address fields) for storage only.
- Update the `bookings` row with `webhook_sent_at = now()`, `webhook_payload = <flat>`, `status = 'submitted'` (drop the `webhook_failed` branch since we are no longer making the outbound call here).
- Return 200 with `{ success: true, bookingId, message: 'Booking saved' }`.

## Verification

1. Submit a test booking from the cost calculator in the preview.
2. Confirm `send-quote-booking-webhook` logs show `status: 200` from the inbound webhook (already working).
3. Confirm `send-booking-webhook` logs no longer contain the 400 "Email is required" error.
4. Confirm the new `bookings` row has `status = 'submitted'` and a populated `webhook_payload` with `email` at the root.
