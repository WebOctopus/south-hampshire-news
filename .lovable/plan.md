## Findings

- The active calculator page uses `AdvertisingStepForm`, which calls `send-quote-booking-webhook` for saved quotes and bookings.
- A direct test through `send-quote-booking-webhook` returned `webhookStatus: 200`, so the forwarding function can reach an inbound webhook successfully.
- The current function only logs `status`/`ok`, not the inbound webhook response body, so we cannot tell from logs whether Mirola CRM created/updated a contact, skipped it, or triggered only a workflow.
- The function still adds `INBOUND_WEBHOOK_API_KEY` when present, but your latest spec says this calculator webhook requires no API key.
- The actual destination is controlled by `QUOTE_BOOKING_WEBHOOK_URL`, so if that secret points anywhere other than the supplied `ee0d6a9b...` URL, submissions will still be delivered to the wrong workflow.

## Plan

1. Update `send-quote-booking-webhook` to follow the Mirola calculator spec exactly:
   - Use the supplied inbound webhook URL directly for this calculator flow.
   - Send JSON only via `POST`.
   - Remove the optional `x-api-key` header from this function.

2. Improve webhook diagnostics:
   - Log the destination URL path/workflow ID, HTTP status, and full response body from the inbound webhook.
   - Return the inbound response body in the function response so frontend/debug logs show whether Mirola skipped, accepted, or errored.
   - Keep `Content-Type: application/json` and CORS responses intact.

3. Tighten payload validation before forwarding:
   - Reject missing root-level `email` with a clear 400 response.
   - Log the root-level `email`, `record_type`, `journey_tag`, and `source` before sending.

4. Update calculator call-site logging in `AdvertisingStepForm`:
   - Capture `{ data, error }` from `send-quote-booking-webhook` for quote and booking submits.
   - Log the returned webhook status/body so failed or skipped CRM sends are visible in the browser console.

5. Validate after implementation:
   - Deploy/test the edge function with a small JSON payload.
   - Check the function logs confirm a `POST` to workflow `ee0d6a9b-5a05-49c3-b6ec-20865b916927`, status, and response body.