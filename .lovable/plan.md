

## Simplify Webhook Payload to Flat CRM-Friendly Format

### Overview

Replace the current verbose webhook payload with a clean, flat JSON structure containing only the business-relevant fields. No UUIDs, no internal metadata, no deeply nested objects.

### Target Output Format

```json
{
  "record_type": "booking",
  "journey_tag": "Fixed Term",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "phone": "07700900000",
  "company": "Acme Ltd",
  "title": "Fixed Term Booking",
  "status": "pending",
  "pricing_model": "fixed",
  "ad_size": "1/2 Page Portrait",
  "duration": "6 issues",
  "subtotal": 352,
  "final_total": 352,
  "monthly_price": 352,
  "total_circulation": 20000,
  "areas": [
    {
      "name": "Area 5 - LOCKS HEATH, PARK GATE...",
      "ad_size": "1/2 Page Portrait",
      "base_price": 176,
      "circulation": 12000
    }
  ],
  "schedule": [
    { "month": "February 2026", "copy_deadline": "12 Jan 2026", "delivery_date": "02 Feb 2026" }
  ],
  "discounts": {
    "agency_discount_percent": 0,
    "volume_discount_percent": 0,
    "duration_discount_percent": 0
  },
  "payment_option": "Monthly Direct Debit",
  "source": "advertising_calculator",
  "submitted_at": "2026-02-24T10:00:00.000Z"
}
```

BOGOF-specific fields (`bogof_paid_areas`, `bogof_free_areas`) will only be included when the pricing model is `bogof` and they have values. Empty arrays are omitted entirely.

### Changes

#### 1. Rewrite `src/lib/webhookPayloadResolver.ts`

Replace the current UUID-resolving approach with a new function `buildCrmWebhookPayload(rawData, lookups)` that:

- Extracts only the fields listed in the target format
- Resolves all UUIDs to names using the lookup arrays (same approach as now, but builds a clean output)
- Builds the `areas` array from `pricing_breakdown.areaBreakdown`, extracting only `name`, `ad_size`, `base_price`, and `circulation`
- Builds the `schedule` array from area schedule data, formatting dates as "DD Mon YYYY" (e.g. "12 Jan 2026")
- Builds a flat `discounts` object with just the three discount percentages
- Omits empty BOGOF arrays, the `pricing_breakdown` object, the `selections` object, and all internal IDs/metadata
- Includes `payment_option` as the resolved display name (only when present)
- Adds `source` and `submitted_at` at the root level (moved from the edge function's `meta` wrapper)

#### 2. Update edge function `supabase/functions/send-quote-booking-webhook/index.ts`

Simplify the edge function to **pass through the payload directly** instead of restructuring it. The client now sends the final CRM-ready shape. The edge function only needs to:

- Read the payload
- Add the `x-api-key` header
- Forward to the webhook URL
- Return the response

Remove the `WebhookPayload` interface reshaping, the `getJourneyTag` mapping (moved to client), and the `data`/`meta` nesting. The edge function becomes a thin proxy.

#### 3. Update all 6 call sites

In each file, replace the verbose raw payload object with a call to `buildCrmWebhookPayload()` that passes the minimal required inputs:

**`src/components/AdvertisingStepForm.tsx`** (2 calls: quote + booking)
- Pass `campaignData`, `contactData`, `selectedPricingModel`, `areas`, `adSizes`, `durations`, `subscriptionDurations`, `paymentOptions`
- The builder function extracts what it needs

**`src/pages/Advertising.tsx`** (2 calls: existing user + new user quote)
- Same pattern with local variable names

**`src/components/dashboard/CreateBookingForm.tsx`** (2 calls: quote + booking)
- Same pattern

Each call site shrinks from ~20 lines to ~5 lines.

### Files Changed

| File | Change |
|---|---|
| `src/lib/webhookPayloadResolver.ts` | Rewrite: new `buildCrmWebhookPayload()` that outputs the flat structure |
| `supabase/functions/send-quote-booking-webhook/index.ts` | Simplify to thin proxy (pass-through) |
| `src/components/AdvertisingStepForm.tsx` | Replace 2 webhook payloads with `buildCrmWebhookPayload()` |
| `src/pages/Advertising.tsx` | Replace 2 webhook payloads with `buildCrmWebhookPayload()` |
| `src/components/dashboard/CreateBookingForm.tsx` | Replace 2 webhook payloads with `buildCrmWebhookPayload()` |

No database changes.
