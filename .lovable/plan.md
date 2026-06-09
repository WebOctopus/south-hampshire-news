## Diagnosis

The cost calculator triggers **two** different edge functions:

1. `send-quote-booking-webhook` — already fixed; uses the `QUOTE_BOOKING_WEBHOOK_URL` secret and is correctly forwarding to `https://qrbijjlviizhzuswiilf.supabase.co/functions/v1/inbound-webhook/ee0d6a9b-…`. Recent logs confirm `status: 200`.
2. `send-booking-webhook` — fires from Step 5 (final booking submit) in `AdvertisingStepForm.tsx`. It still has a **hardcoded** Go High-Level URL:
   ```
   https://services.leadconnectorhq.com/hooks/gq9xLtPI8nwa8W9JRPBa/webhook-trigger/bf5bfcbd-01eb-4419-8eda-dbd1336c7d4a
   ```
   This is why the final booking from the screenshot's Step 5 isn't reaching the new inbound webhook.

## Change

`supabase/functions/send-booking-webhook/index.ts` — replace the hardcoded GHL URL with the same `QUOTE_BOOKING_WEBHOOK_URL` env secret already used by `send-quote-booking-webhook`, so it posts to:
`https://qrbijjlviizhzuswiilf.supabase.co/functions/v1/inbound-webhook/ee0d6a9b-5a05-49c3-b6ec-20865b916927`

Also attach the `INBOUND_WEBHOOK_API_KEY` header (matching the quote function) and keep all existing booking-row update logic (`webhook_sent_at`, `webhook_response`, `webhook_payload`, status).

## Verify

- Deploy `send-booking-webhook` and POST a sample booking payload via `curl_edge_functions`; confirm 200 from inbound-webhook and that the booking row updates correctly.
- Re-check edge function logs.

## Out of scope

- `send-competition-entry-webhook` (already updated to the competitions URL).
- `send-quote-booking-webhook` (already working).
