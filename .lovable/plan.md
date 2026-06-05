## Goal
Point the competition entry webhook to the new URL:
`https://qrbijjlviizhzuswiilf.supabase.co/functions/v1/inbound-webhook/bd116a69-213e-4fe4-a0f8-65b7dd8db823`

## Change
- `supabase/functions/send-competition-entry-webhook/index.ts` — replace the hardcoded URL (currently on the `nztjzyhtynfijonrkuem` host) with the new `qrbijjlviizhzuswiilf` host. UUID path stays the same.

## Verify
- Deploy the edge function and POST a test competition entry payload via `curl_edge_functions`, confirm 200 response and forwarded status.

## Out of scope
- Quote/booking webhook (already updated separately via `QUOTE_BOOKING_WEBHOOK_URL` secret).
- Final booking confirmation webhook (`send-booking-webhook`).
