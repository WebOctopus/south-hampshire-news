

## Fix: Quote Email Missing Business Name & Password

### Problem
The saved quote confirmation email sent to customers has two issues:
1. **Business/company name not showing** — the edge function builds template variables but doesn't include `company` in the customer email variable map
2. **Password not appearing** — the credentials block may not inject properly into DB-managed templates

### Root Cause

**File: `supabase/functions/send-booking-confirmation-email/index.ts`**

- Line 403: The `vars` object for customer templates includes many variables but is missing `company`. The admin email (line 332) correctly includes `company`, but the customer template does not.
- Lines 428-434: The `login_credentials` and `login_password` vars are set, but if the DB template doesn't contain `{{login_credentials}}`, the fallback injection (lines 469-476) tries to insert it "early" using regex matching. This approach can fail depending on the template HTML structure.

### Fix

**File: `supabase/functions/send-booking-confirmation-email/index.ts`**

1. Add `company: payload.company || ""` to the customer template vars (around line 403)
2. Ensure the fallback credentials injection is more robust — if insertion before "Summary" or footer fails, insert after the greeting paragraph more reliably
3. Also add `company` to the `EmailPayload` interface docs for clarity (already present but worth confirming the flow)

**File: `src/pages/Advertising.tsx`** (secondary fix)

The public-facing quote save flow does NOT call `send-booking-confirmation-email` at all — only the CRM webhook is sent. Add a `send-booking-confirmation-email` invocation for both the existing-user and new-user paths, passing `company`, and for new users, the password. This mirrors what `AdvertisingStepForm.tsx` and `CreateBookingForm.tsx` already do.

### Files Changed
- `supabase/functions/send-booking-confirmation-email/index.ts` — add `company` to customer vars
- `src/pages/Advertising.tsx` — add confirmation email call for both quote save paths (existing user + new user), including password for new users

