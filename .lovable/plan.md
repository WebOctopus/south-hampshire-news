

## Fix: Password Credentials Not Included in Admin-On-Behalf Quote Emails

### Problem

When an admin creates a quote on behalf of a customer, the confirmation email is sent but the login credentials (email + generated password) are not appearing in it. The system currently embeds credentials inline in the confirmation email rather than sending a separate password email.

### Root Cause

There are two likely issues:

1. **DB template fallback injection can fail silently.** When a DB template is found (line 377-446 of the edge function), the code tries to inject the credentials block before `</body>` if the template doesn't contain `{{login_credentials}}`. If the template HTML doesn't have a `</body>` tag (common with partial HTML templates), the `replace('</body>', ...)` call does nothing — credentials are silently dropped.

2. **Password variable mismatch.** In `AdvertisingStepForm.tsx`, the password sent to create the user (line 273: `contactData.generatedPassword || crypto.randomUUID()`) could differ from what's passed to the email (line 470: `contactData.generatedPassword || contactData.password`). If the admin flow generates a NEW password at line 273 (because `contactData.generatedPassword` was falsy), that new password is used for account creation but the email payload gets `contactData.password` instead (which is empty in admin mode since the password field is hidden).

### Solution

Two changes to ensure credentials always reach the customer:

**1. Fix password consistency in `src/components/AdvertisingStepForm.tsx`** (quote flow, ~line 270-470):
- Store the actual `generatedPassword` used for account creation and pass THAT to the email payload, not `contactData.generatedPassword || contactData.password`.
- Same fix for the booking flow (~line 580-892).

**2. Fix template injection in `supabase/functions/send-booking-confirmation-email/index.ts`** (line 440-445):
- Instead of relying on `</body>` replacement, prepend the credentials block at the top of the template body content (before the first content).
- If the template has no `{{login_credentials}}` placeholder AND the email is admin-created with a generated password, insert the credentials block right after the opening greeting/content.

### Files Changed
- `src/components/AdvertisingStepForm.tsx` — use the actual generated password variable in the email payload
- `supabase/functions/send-booking-confirmation-email/index.ts` — make credentials injection more robust

