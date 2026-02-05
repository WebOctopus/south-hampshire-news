

## Plan: Quote & Booking Webhook Integration

### Overview

Add the ability to send quote and booking data to an external webhook endpoint when they are created. Each submission will include a `journey_tag` field identifying the package type:
- **"Fixed Term"** - for `pricing_model: 'fixed'`
- **"3+ Repeat Package"** - for `pricing_model: 'bogof'`
- **"Leafleting Service"** - for `pricing_model: 'leafleting'`

This allows your CRM system to differentiate between data journeys and route them appropriately.

---

### Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend Calculator                          │
│  (AdvertisingStepForm, CreateBookingForm, Advertising page)         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Supabase Database                               │
│               (quotes / bookings tables)                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│              send-quote-booking-webhook Edge Function               │
│  - Receives quote/booking data                                      │
│  - Adds journey_tag based on pricing_model                          │
│  - Sends to QUOTE_BOOKING_WEBHOOK_URL                               │
│  - Uses INBOUND_WEBHOOK_API_KEY for authentication                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│               External CRM Webhook Endpoint                         │
│  (Your destination system)                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Implementation Steps

#### 1. Create New Edge Function

Create `supabase/functions/send-quote-booking-webhook/index.ts`:

- Accept quote or booking data as JSON payload
- Include a `record_type` field: `"quote"` or `"booking"`
- Include a `journey_tag` field based on `pricing_model`:
  - `"Fixed Term"` for `fixed`
  - `"3+ Repeat Package"` for `bogof`
  - `"Leafleting Service"` for `leafleting`
- Flatten contact fields to root level (email, first_name, last_name, phone, company) for CRM compatibility
- Send to `QUOTE_BOOKING_WEBHOOK_URL` using `INBOUND_WEBHOOK_API_KEY`
- Log success/failure for debugging

#### 2. Add New Secret

Add `QUOTE_BOOKING_WEBHOOK_URL` secret with value:
`https://nztjzyhtynfijonrkuem.supabase.co/functions/v1/inbound-webhook`

(This uses the existing `INBOUND_WEBHOOK_API_KEY` for authentication)

#### 3. Update config.toml

Register the new edge function with `verify_jwt = false` for public access.

#### 4. Integrate Webhook Calls

Trigger the webhook from these locations:

**Quote Creation:**
- `src/components/AdvertisingStepForm.tsx` - when saving quotes (handleContactInfoSave)
- `src/components/dashboard/CreateBookingForm.tsx` - handleSaveAsQuote
- `src/pages/Advertising.tsx` - handleSaveQuote

**Booking Creation:**
- `src/components/AdvertisingStepForm.tsx` - when creating bookings (handleContactInfoBook)
- `src/components/dashboard/CreateBookingForm.tsx` - handleBookNow

---

### Webhook Payload Structure

```json
{
  "record_type": "quote",
  "journey_tag": "3+ Repeat Package",
  
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "phone": "07123456789",
  "company": "Smith & Co",
  
  "form_category": "advertising_quote",
  
  "data": {
    "record_id": "uuid",
    "pricing_model": "bogof",
    "title": "3+ Repeat Package Quote",
    "ad_size": "Half Page",
    "duration": "6 months",
    "selected_areas": ["Area 1", "Area 2"],
    "bogof_paid_areas": ["Area 1", "Area 2", "Area 3"],
    "bogof_free_areas": ["Area 4", "Area 5", "Area 6"],
    "total_circulation": 45000,
    "subtotal": 1200,
    "final_total": 1080,
    "monthly_price": 90,
    "volume_discount_percent": 10,
    "status": "draft"
  },
  
  "meta": {
    "source": "advertising_calculator",
    "page_url": "https://...",
    "submitted_at": "2026-02-05T11:30:00Z"
  }
}
```

---

### Technical Details

**New Files:**
- `supabase/functions/send-quote-booking-webhook/index.ts`

**Modified Files:**
- `supabase/config.toml` - add function config
- `src/components/AdvertisingStepForm.tsx` - add webhook invocation after quote/booking save
- `src/components/dashboard/CreateBookingForm.tsx` - add webhook invocation
- `src/pages/Advertising.tsx` - add webhook invocation

**Secret Required:**
- `QUOTE_BOOKING_WEBHOOK_URL` with value: `https://nztjzyhtynfijonrkuem.supabase.co/functions/v1/inbound-webhook`

---

### Journey Tag Mapping

| Pricing Model | Journey Tag | Description |
|---------------|-------------|-------------|
| `fixed` | Fixed Term | One-time campaign with set duration |
| `bogof` | 3+ Repeat Package | Buy one get one free, 6-month subscription |
| `leafleting` | Leafleting Service | Direct mail distribution |

