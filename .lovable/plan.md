

## Fix: Admin-On-Behalf Emails Not Sending + Existing User Login Prompt

### Problem
Two issues:
1. **Emails not sending at all** — The `send-booking-confirmation-email` edge function has zero logs, indicating it wasn't successfully deployed after the last edit. It needs to be redeployed.
2. **Existing users should get a login prompt, not a new password** — The code logic for existing users already exists (sends `is_existing_user: true` and the edge function has `buildExistingUserLoginHtml()`), but it's not working because the function isn't deployed.

### Changes

**1. Redeploy the edge function**
- Deploy `send-booking-confirmation-email` — the previous edit added the robust credential injection logic but deployment may have failed or not completed.

**2. Verify existing user email path in `AdvertisingStepForm.tsx`**
- The current code at line 471-476 already correctly differentiates:
  - New user → sends `generated_password` for credential block
  - Existing user → sends `is_existing_user: true` for login prompt block
- No code change needed here — the logic is correct.

**3. Verify edge function handles both paths**
- `buildExistingUserLoginHtml()` (line 190-199) already renders a "Log In to Your Dashboard" block with a link to `/auth` and a "Forgot Password" reminder — this matches the user's requirement.
- The fallback injection at line 454-463 correctly injects this block for existing users when the template lacks `{{login_credentials}}`.
- No code change needed in the edge function either.

### Root Cause
The edge function was edited but not successfully deployed. Redeploying it should fix both issues — emails will send again, and existing users will get a login prompt instead of credentials.

### Summary
This is a deployment-only fix. No code changes required — just redeploy the `send-booking-confirmation-email` edge function.

