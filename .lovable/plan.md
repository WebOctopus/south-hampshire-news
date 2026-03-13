

## Add "Email New Password" Option to Set Password Dialog

### What We'll Build
Add a checkbox/toggle in the "Set User Password" dialog that lets the admin optionally send an email to the user with their new password via Resend. Uses the existing Resend integration and sender identity (`Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>`).

### Changes

1. **Update `supabase/functions/admin-manage-user/index.ts`**
   - Add a `send_email` boolean and `user_email` string to the `set_password` action
   - When `send_email` is true, use Resend (via `RESEND_API_KEY`) to send a branded email containing the new password to the user
   - Email from: `Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>`
   - Attempt to fetch a `password_set_admin` template from the `email_templates` table; fall back to a hardcoded branded HTML email

2. **Update `src/pages/AdminDashboard.tsx`**
   - Add a checkbox "Send password to user via email" in the Set Password dialog (below the password input)
   - Add state for `sendPasswordEmail` (default: false)
   - Pass `send_email: true` and `user_email` to the edge function when checked
   - Show confirmation in toast when email is sent

### Technical Details
- Resend SDK and `RESEND_API_KEY` are already available in secrets
- The edge function already has the user's email available via `list_users_with_email` action or can fetch it with `adminClient.auth.admin.getUserById()`
- No new secrets or migrations needed

