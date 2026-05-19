## Goal
Make sure customers who complete the **3+ Subscription (BOGOF)** booking form reliably receive the confirmation email that tells them what happens next (including setting up their Direct Debit from their dashboard).

The existing in-dashboard GoCardless "Set Up Payment Plan" flow is **not changed** — BOGOF customers continue to set up payment themselves from their dashboard exactly as today.

## Findings

The BOGOF "Book" journey in `src/components/AdvertisingStepForm.tsx` → `handleContactInfoBook` does call `send-booking-confirmation-email` after inserting the booking, and the BOGOF template exists. I tested the edge function directly with a BOGOF payload — it returned `success: true` via Resend. So the function works in isolation.

Two reliability problems explain why the email "doesn't seem to arrive" for end-to-end BOGOF customers:

1. **Fire-and-forget invoke + immediate navigation.** The `send-booking-confirmation-email` invoke is wrapped in its own `try/catch` but the surrounding flow does not `await` the network round-trip before `setTimeout(() => navigate('/dashboard'), 1500)`. Catches log to `console.error` only. A transient Resend hiccup, slow network, or the page transition cancelling the in-flight `fetch` will lose the email with zero trace.
2. **No audit trail.** Edge function logs are short-retention and there is no `email_send_log` table. When a customer says "I didn't get an email", there is no way to confirm whether the function was invoked, let alone whether Resend accepted it.

## Changes

### 1. Add an `email_send_log` table
New table with columns: `id`, `booking_id` (nullable), `quote_id` (nullable), `template_name`, `recipient_email`, `recipient_type` (`'customer' | 'admin'`), `status` (`'sent' | 'failed'`), `provider_message_id`, `error_message`, `metadata jsonb`, `created_at`. RLS: admins can read all; writes only via service role from the edge function.

### 2. Write to `email_send_log` from `send-booking-confirmation-email`
In `supabase/functions/send-booking-confirmation-email/index.ts`, after each Resend send (admin + customer), insert a row capturing success/failure, Resend message id, and any error. Gives us a permanent record we can query.

### 3. Await the confirmation-email invoke in the booking flow
In `src/components/AdvertisingStepForm.tsx` (`handleContactInfoBook`), `await` the `send-booking-confirmation-email` invoke before the `setTimeout` redirect fires. Other webhooks can stay fire-and-forget. Apply the same `await` change at equivalent call sites in:
- `src/pages/Advertising.tsx`
- `src/components/dashboard/CreateBookingForm.tsx`

This removes the navigation-cancels-fetch race that disproportionately affects BOGOF customers.

### 4. Surface a softer warning if the email fails
If the awaited invoke returns an error, show a non-blocking toast: *"Your booking is saved, but we couldn't send your confirmation email. Our team will follow up shortly."* and still proceed to the dashboard. Customer knows to expect follow-up instead of silently wondering.

## Explicitly NOT changing
- **Dashboard payment flow stays exactly as today** — BOGOF customers continue to set up their Direct Debit themselves via the existing "Set Up Payment Plan" / GoCardless journey inside their dashboard.
- No changes to `gocardless-webhook`, `PaymentSetup.tsx`, mandate/subscription creation, or invoice generation.
- No new post-payment email — the existing pre-payment `booking_bogof_customer` template already explains the next steps.
- No template copy changes, no Resend domain switch, no Lovable Emails migration.
- No changes to Fixed Term or Leafleting beyond the shared `await` fix in step 3 (they get the same reliability benefit "for free").
