

## Replace Lovable URLs with peacockpixelmedia.co.uk in email edge functions

The screenshot confirms that email links (e.g. the "dashboard" link) currently point to `south-hampshire-news.lovable.app`. All instances need to be replaced with `https://peacockpixelmedia.co.uk`.

### Files to update

**1. `supabase/functions/send-welcome-email/index.ts`**
- Line 84: fallback HTML dashboard link -> `https://peacockpixelmedia.co.uk/dashboard`
- Line 134: template variable `dashboard_url` -> `https://peacockpixelmedia.co.uk/dashboard`

**2. `supabase/functions/send-booking-confirmation-email/index.ts`**
- Line 146: admin dashboard link -> `https://peacockpixelmedia.co.uk/admin`
- Line 215: customer dashboard link -> `https://peacockpixelmedia.co.uk/dashboard`
- Line 227: website footer link -> `https://peacockpixelmedia.co.uk`
- Line 228: contact footer link -> `https://peacockpixelmedia.co.uk/contact`
- Line 229: advertise footer link -> `https://peacockpixelmedia.co.uk/advertising`
- Line 272: admin_url template variable -> `https://peacockpixelmedia.co.uk/admin`
- Line 316: dashboard_url template variable -> `https://peacockpixelmedia.co.uk/dashboard`

### Summary

A simple find-and-replace of `https://south-hampshire-news.lovable.app` with `https://peacockpixelmedia.co.uk` across both edge function files. No logic changes needed. Both functions will be redeployed automatically.

### Technical detail

The database-stored email templates were checked and contain no Lovable URLs, so only the hardcoded fallback HTML and template variable defaults need updating.
