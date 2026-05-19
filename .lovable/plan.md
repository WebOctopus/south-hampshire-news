## Goal
Guarantee that every customer who clicks **Book Now** on the 3+ Subscription (BOGOF) form receives a confirmation email with their booking details.

## Findings

There are two BOGOF "Book Now" branches in `src/components/AdvertisingStepForm.tsx → handleContactInfoBook`:

1. **Eligible new BOGOF customer** (lines ~764+): inserts into `bookings` and **already** calls `send-booking-confirmation-email` with `record_type: 'booking'`, `pricing_model: 'bogof'`. The DB template `booking_bogof_customer` exists. The recent audit-log + toast work covers this path.

2. **Returning BOGOF customer** (lines 688–762): eligibility check flips `isReturningBogofCustomer = true`, the code saves a `bogof_return_interest` row into `quotes` + `quote_requests`, shows a "Thanks for Your Interest!" toast, and **early-returns at line 761 without sending any email**. Database shows 5 such records over the past 3 months — none of those customers received a confirmation email after clicking Book Now.

This is the gap that matches the user's report.

## Changes

### 1. Send a confirmation email in the returning-BOGOF branch
In `handleContactInfoBook`, after the `quote_requests` insert and before the `setTimeout(navigate)`, await a call to `send-booking-confirmation-email` with:
- `record_type: 'quote'` (it's saved as a quote/lead, not a booking)
- `pricing_model: 'bogof'`
- `record_id`: the inserted quote id (capture it from `.select('id').single()`)
- `contact_name`, `email`, `phone`, `company`, `title` from the payload we already built
- `bogof_paid_areas` / `bogof_free_areas` mapped to names (same mapping the eligible branch uses)
- `selected_areas`, `total_circulation`, `subtotal`, `final_total`, `monthly_price`, `pricing_breakdown`, `selections`, `distribution_start_date`
- A new flag `is_returning_bogof_customer: true` so the template (and future template variants) can tailor copy

### 2. Add a dedicated template for returning BOGOF customers
Create a new DB row in `email_templates`:
- `name = 'quote_bogof_return_interest_customer'`
- Subject: *"Thanks for your interest — Discover Magazine 3+ Subscription"*
- Body: explains the booking interest has been received, our team will be in touch with returning-customer rates, includes their selected areas + ad size + duration for confirmation, plus support contact details. Reuses the existing branded shell from `quote_bogof_customer` for consistency.

The edge function's existing fallback (specific template name → generic `quote_saved_customer`) means even if the template row isn't created in time, the customer still gets a generic confirmation. The dedicated template is just nicer.

### 3. Reuse existing reliability work
No new code needed — the edge function already:
- Writes every send (success or failure) to `email_send_log`.
- Returns `customer_email_sent: boolean`.

The new call site will check that flag and show the same soft toast warning ("Booking interest saved — confirmation email delayed, our team will follow up") if the send fails, matching the existing eligible-branch behaviour.

### 4. Light verification after deploy
Run a quick `email_send_log` query for the test BOGOF booking the user is about to make, to confirm a row appears with `status = 'sent'`.

## Explicitly NOT changing
- Dashboard GoCardless "Set Up Payment Plan" flow.
- The eligible BOGOF booking path (already emails + logs after the last change).
- Quote save / Fixed Term / Leaflet flows.
- Template copy of `booking_bogof_customer` itself.
