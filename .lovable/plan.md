

## Resolve UUIDs to Human-Readable Names in Webhook Payloads

### Problem

The `send-quote-booking-webhook` edge function receives and forwards raw UUIDs for areas, payment options, and other fields. The receiving CRM system cannot resolve these IDs. Some fields (`ad_size`, `duration`) are already resolved to names, but many others are not.

### Approach

Create a shared **resolver helper function** that converts all UUID-based fields to their human-readable equivalents before sending to the webhook. This runs client-side where all lookup data (areas, ad sizes, durations, payment options) is already loaded.

### Fields to Resolve

| Field | Current Value | Resolved To |
|---|---|---|
| `selected_areas` | `["uuid1", "uuid2"]` | `["SOUTHAMPTON", "CHANDLER'S FORD"]` |
| `bogof_paid_areas` | `["uuid1"]` | `["SOUTHAMPTON"]` |
| `bogof_free_areas` | `["uuid2"]` | `["WINCHESTER"]` |
| `pricing_breakdown.areaBreakdown[].area` | Full area object with `id` | Add `area_name` field with the area's name |
| `selections.selectedAdSize` | UUID | Ad size name (e.g. "Full Page") |
| `selections.selectedDuration` | UUID | Duration label (e.g. "1 Issue = 2 months") |
| `selections.selectedAreas` | UUID array | Area name array |
| `selections.bogofPaidAreas` | UUID array | Area name array |
| `selections.bogofFreeAreas` | UUID array | Area name array |
| `selections.payment_option_id` | UUID | Payment option display name |
| `selections.selectedMonths` | `{ "uuid": ["April"] }` | `{ "SOUTHAMPTON": ["April"] }` |
| `selections.months` | `{ "uuid": [...] }` | `{ "SOUTHAMPTON": [...] }` |
| `selections.areas.paid` / `selections.areas.free` (bogof variant) | UUID arrays | Area name arrays |

### Implementation

#### 1. New helper: `src/lib/webhookPayloadResolver.ts`

A single utility file with a function `resolveWebhookPayload(payload, lookups)` that:
- Takes the raw webhook body and lookup arrays (areas, adSizes, durations, paymentOptions)
- Returns a new object with all UUIDs replaced by display names
- Handles all the field mappings listed above
- Leaves non-UUID fields untouched

```text
resolveWebhookPayload(rawPayload, { areas, adSizes, durations, subscriptionDurations, paymentOptions })
  -> returns payload with all IDs resolved to names
```

#### 2. Update 3 call sites

Each file that calls `send-quote-booking-webhook` will import the resolver and wrap the payload:

**`src/components/AdvertisingStepForm.tsx`** — 2 calls (quote + booking)
- Import `resolveWebhookPayload`
- Wrap the `body` object through the resolver before passing to `supabase.functions.invoke`

**`src/pages/Advertising.tsx`** — 2 calls (existing user quote + new user quote)
- Same pattern

**`src/components/dashboard/CreateBookingForm.tsx`** — 2 calls (quote + booking)
- Same pattern

### Example Before/After

**Before (sent to CRM):**
```json
{
  "selected_areas": ["a1b2c3d4-...", "e5f6g7h8-..."],
  "selections": {
    "selectedAdSize": "x9y0z1a2-...",
    "selectedMonths": { "a1b2c3d4-...": ["April"] }
  },
  "pricing_breakdown": {
    "areaBreakdown": [{ "area": { "id": "a1b2c3d4-...", "name": "SOUTHAMPTON", ... } }]
  }
}
```

**After (sent to CRM):**
```json
{
  "selected_areas": ["SOUTHAMPTON", "CHANDLER'S FORD"],
  "selections": {
    "selectedAdSize": "Full Page",
    "selectedMonths": { "SOUTHAMPTON": ["April"] }
  },
  "pricing_breakdown": {
    "areaBreakdown": [{ "area_name": "SOUTHAMPTON", "basePrice": 50, "multipliedPrice": 50 }]
  }
}
```

### Files Changed

| File | Change |
|---|---|
| `src/lib/webhookPayloadResolver.ts` | **New file** — resolver helper |
| `src/components/AdvertisingStepForm.tsx` | Wrap 2 webhook calls with resolver |
| `src/pages/Advertising.tsx` | Wrap 2 webhook calls with resolver |
| `src/components/dashboard/CreateBookingForm.tsx` | Wrap 2 webhook calls with resolver |

No database changes. No edge function changes needed — the edge function already forwards whatever it receives.
