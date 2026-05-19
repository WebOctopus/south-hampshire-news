## Goal
Ensure the Invoice Address captured in the Cost Calculator's contact step (postcode, address line 1, address line 2, town/city) is included in the webhook payload(s) sent to the CRM.

## Findings
- `ContactInformationStep.tsx` collects: `postcode`, `addressLine1`, `addressLine2`, `city`.
- In `AdvertisingStepForm.tsx`, when building quote / booking records, the code reads `contactData.address` (which doesn't exist — the field is `addressLine1`). So address data is currently being silently dropped into `selections.address = ''`.
- Two webhook edge functions are involved:
  - `send-quote-booking-webhook` — receives a payload built by `buildCrmWebhookPayload` in `src/lib/webhookPayloadResolver.ts`. This builder does not emit any address fields.
  - `send-booking-webhook` — emits `contact.invoiceAddress: step3Data.invoiceAddress`, but `contactData` has no `invoiceAddress` field, so the value is `undefined`.

## Changes

### 1. Fix field-name mismatch in `src/components/AdvertisingStepForm.tsx`
Replace the four occurrences of `contactData.address` with `contactData.addressLine1` (in the quote `selections`, booking `selections`, and the `bogof_return_interest` quote `selections`). Persist `addressLine1`, `addressLine2`, `city`, `postcode` consistently in `selections`.

### 2. Include invoice address in CRM payload (`src/lib/webhookPayloadResolver.ts`)
Extend `buildCrmWebhookPayload` to read invoice address from either the raw input or `raw.selections` and emit flat CRM-friendly fields:
- `invoice_postcode`
- `invoice_address_line_1`
- `invoice_address_line_2`
- `invoice_city`
- `invoice_address` (single-line concatenation: `"<line1>, <line2>, <city>, <postcode>"`, skipping empties) for convenience in the CRM.

### 3. Pass invoice address to the resolver in `AdvertisingStepForm.tsx`
At each `resolveWebhookPayload({...}, lookups)` call (quote save, booking save, plus the dashboard variants), add:
```ts
invoice_address: {
  postcode: contactData.postcode,
  address_line_1: contactData.addressLine1,
  address_line_2: contactData.addressLine2,
  city: contactData.city,
}
```
Also apply this in `src/components/dashboard/CreateBookingForm.tsx` and `src/components/dashboard/BookingDetailsDialog.tsx` where the same resolver is called (using their existing `selections` address fields).

### 4. Update `supabase/functions/send-booking-webhook/index.ts`
Replace the single `invoiceAddress: step3Data.invoiceAddress` with an object built from the flat fields:
```ts
invoiceAddress: {
  postcode: step3Data.postcode,
  addressLine1: step3Data.addressLine1,
  addressLine2: step3Data.addressLine2,
  city: step3Data.city,
}
```
No other changes to that function.

## Out of scope
- No DB schema changes (the address is already persisted inside `bookings.selections` / `quotes.selections`).
- No UI changes to the Invoice Address card.
- Email templates and other edge functions are not modified.
