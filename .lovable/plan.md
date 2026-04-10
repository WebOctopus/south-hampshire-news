

## Fix Event Organiser Email: Production URL + Login Credentials

### Problem
The "send-event-organiser-login" Edge Function uses Lovable preview URLs (`south-hampshire-news.lovable.app`) instead of the production domain. The email already includes login credentials for new users, but the links point to the wrong site.

### Changes

**File: `supabase/functions/send-event-organiser-login/index.ts`**

Update the two URL constants (lines 34-37):
- Dashboard URL: `https://south-hampshire-news.lovable.app/dashboard` → `https://www.peacockpixelmedia.co.uk/dashboard`
- Event URL base: `https://south-hampshire-news.lovable.app/events/` → `https://www.peacockpixelmedia.co.uk/events/`

That's it -- the email already handles both scenarios correctly:
- **New users**: Shows their email + generated password in a credentials box, plus a "Log In to Your Dashboard" button
- **Existing users**: Shows a "Log In to Your Dashboard" button with a reminder about "Forgot Password"

The only issue is the URLs pointing to the wrong domain. One file, two line changes.

