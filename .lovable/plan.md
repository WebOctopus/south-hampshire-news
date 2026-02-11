

## Plan: Booking/Quote Confirmation Emails via Resend

### Overview
Create a new Supabase Edge Function that sends two branded HTML emails whenever a booking is created or a quote is saved:
1. **Admin notification email** -- tells the Discover Magazine team that a new booking/quote has come in, with full details.
2. **Customer confirmation email** -- tells the user their booking/quote was received, what it contains, and what they need to do next (e.g. set up payment via their dashboard).

The function will be called from the same places that currently call `send-quote-booking-webhook` (the CRM webhook), so both the main advertising calculator and the dashboard "Create Booking" form are covered.

### New Secret Required

| Secret | Purpose |
|--------|---------|
| `ADMIN_NOTIFICATION_EMAIL` | The email address(es) where admin notifications should be sent (e.g. `info@peacockpixelmedia.co.uk`) |

You will be prompted to set this value during implementation.

### Step 1: Create the Edge Function

**New file:** `supabase/functions/send-booking-confirmation-email/index.ts`

- Uses Resend (same pattern as `send-welcome-email`)
- Accepts the same payload shape as `send-quote-booking-webhook` (record_type, pricing_model, contact details, pricing breakdown, etc.)
- Sends **two emails**:

**Email A -- Admin Notification:**
- To: `ADMIN_NOTIFICATION_EMAIL`
- Subject: "New [Booking/Quote] Received -- [Fixed Term / 3+ Repeat Package / Leafleting]"
- Body: Branded HTML with all campaign details (customer name, email, phone, company, ad size, duration, areas, pricing breakdown, total)

**Email B -- Customer Confirmation:**
- To: The customer's email address
- Subject depends on record_type:
  - Booking: "Your Discover Magazine Booking Confirmation"
  - Quote: "Your Discover Magazine Quote Has Been Saved"
- Body: Branded HTML matching the existing Discover Magazine email style (green header, footer with company info), containing:
  - Greeting with their name
  - Summary of what they selected (package type, ad size, areas, duration, total cost)
  - **Next steps section** (different for booking vs quote):
    - **Booking:** "1. Log in to your dashboard, 2. Set up your Direct Debit payment, 3. We'll confirm your campaign schedule, 4. Your advert will appear in the next available issue"
    - **Quote:** "1. Log in to your dashboard to review your quote, 2. When ready, convert your quote to a booking, 3. Set up payment to confirm your campaign"
  - Contact details for questions (phone number, email)
  - CTA button linking to dashboard

### Step 2: Add config.toml entry

```toml
[functions.send-booking-confirmation-email]
verify_jwt = false
```

### Step 3: Call the new function from existing save/book flows

**Files to modify:**

| File | Where | Change |
|------|-------|--------|
| `src/components/AdvertisingStepForm.tsx` | After quote webhook (~line 475) | Add `supabase.functions.invoke('send-booking-confirmation-email', { body: ... })` |
| `src/components/AdvertisingStepForm.tsx` | After booking CRM webhook (~line 847) | Add same call with `record_type: 'booking'` |
| `src/components/dashboard/CreateBookingForm.tsx` | After quote webhook (~line 256) | Add same call |
| `src/components/dashboard/CreateBookingForm.tsx` | After booking webhook (~line 358) | Add same call |

Each call reuses the same payload already being sent to the CRM webhook, so no new data gathering is needed. Failures are caught silently (non-blocking) so they don't prevent the booking/quote from being saved.

### Step 4: Deploy and test

- Deploy the edge function
- Test by saving a quote and creating a booking from the calculator
- Verify both admin and customer emails arrive

### Technical Notes

- The edge function uses `RESEND_API_KEY` (already configured) and sends from `Discover Magazine <noreply@peacockpixelmedia.co.uk>` (the verified domain already in use)
- The function maps `pricing_model` to human-readable names: `fixed` becomes "Fixed Term", `bogof` becomes "3+ Repeat Package", `leafleting` becomes "Leafleting Service"
- Email HTML follows the same table-based layout and green brand colours used in the existing welcome and password reset emails
- The returning BOGOF customer flow in `handleContactInfoBook` (which saves as a quote request instead of booking) will also trigger the email with `record_type: 'quote'`

