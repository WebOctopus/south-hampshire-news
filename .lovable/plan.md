## Goal
When a returning BOGOF customer clicks **Book Now**, also send their data to your CRM via the existing `send-quote-booking-webhook` — matching what the eligible-booking path already does.

## Findings

In `src/components/AdvertisingStepForm.tsx → handleContactInfoBook`, the eligible BOGOF branch posts to `send-quote-booking-webhook` (the external CRM webhook, via `resolveWebhookPayload`) with the full booking payload including `invoice_address`, `bogof_paid_areas`, `bogof_free_areas`, etc.

The **returning-BOGOF branch** (the `isReturningBogofCustomer` block) inserts into `quotes` + `quote_requests`, now sends the confirmation email, but does **not** call the CRM webhook — so the CRM never learns about returning-customer interest leads.

Noted: GoHighLevel is no longer in use. The legacy `send-booking-webhook` call in the eligible branch is out of scope for this change; only `send-quote-booking-webhook` is your active CRM webhook.

## Change

In the returning-BOGOF branch (right after the `quotes` + `quote_requests` inserts and the confirmation-email block), add a single call to `send-quote-booking-webhook` with:

- `record_type: 'quote'`
- `record_id: insertedQuote?.id`
- `pricing_model: 'bogof'`
- `status: 'bogof_return_interest'` (so the CRM can route returning-customer leads differently from confirmed bookings)
- `is_returning_bogof_customer: true` flag
- Same field set as the eligible branch: contact name, email, phone, company, `title`, `ad_size`, `duration`, `selected_areas`, `bogof_paid_areas`, `bogof_free_areas`, totals (`subtotal`, `final_total`, `monthly_price`, `total_circulation`, `volume_discount_percent`), `pricing_breakdown`, `selections`, and `invoice_address` (`postcode`, `address_line_1`, `address_line_2`, `city`)
- Same `bookingWebhookLookups` object (`areas, adSizes, durations, subscriptionDurations, paymentOptions, leafletAreas, leafletSizes, leafletDurations`) passed to `resolveWebhookPayload` so IDs resolve to names before sending

Wrap in try/catch with `console.error` only — non-blocking, same pattern as the eligible branch. No user-facing toast on webhook failure.

## Explicitly NOT changing
- Eligible BOGOF / Fixed Term / Leaflet webhook paths — already working.
- The legacy `send-booking-webhook` (GHL) — not touched; we'll leave any cleanup of that for a separate request.
- Confirmation email logic added in the previous step.
- `resolveWebhookPayload` or any edge function code.
