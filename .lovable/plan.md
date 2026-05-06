## Goal

Fix the password reset link so it redirects to `discovermagazines.co.uk/reset-password` instead of the old `peacockpixelmedia.co.uk/reset-password`. Keep Resend sender addresses unchanged (still `@peacockpixelmedia.co.uk`).

## Root Cause

`supabase/functions/send-password-reset/index.ts` hard-codes:
```ts
const siteUrl = "https://peacockpixelmedia.co.uk";
...
redirectTo: `${siteUrl}/reset-password`
```
This is what produces the broken `redirect_to=https://peacockpixelmedia.co.uk/reset-password` link in the email.

## Changes

Replace `peacockpixelmedia.co.uk` → `discovermagazines.co.uk` **only for site URLs / links / image hosts**, not for email `from:` addresses.

Files to update:

- `supabase/functions/send-password-reset/index.ts` — fixes the actual reset link (`siteUrl`, logo `<img>`, footer Website/Contact links)
- `supabase/functions/send-welcome-email/index.ts` — dashboard URL, logo
- `supabase/functions/send-booking-confirmation-email/index.ts` — admin/dashboard/auth/contact links, logo
- `supabase/functions/send-event-notification/index.ts` — eventUrl, adminUrl
- `supabase/functions/send-event-organiser-login/index.ts` — dashboardUrl, event link, logo
- `supabase/functions/admin-manage-user/index.ts` — logo image URLs
- `supabase/functions/event-og/index.ts` — `SITE_URL`, fallback OG image

**Explicitly NOT changed**: every `from: "Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>"` line stays as-is, since that's the verified Resend sender domain.

## Important: Supabase Auth URL Configuration

For the new redirect URL to actually work (and not be silently dropped by Supabase), the Supabase Auth settings must allow it:

- **Site URL**: `https://discovermagazines.co.uk`
- **Additional Redirect URLs** must include:
  - `https://discovermagazines.co.uk/reset-password`
  - `https://www.discovermagazines.co.uk/reset-password`

I can't change this from code — please update it in the Supabase dashboard under Authentication → URL Configuration. I'll include the link after applying the code changes.
