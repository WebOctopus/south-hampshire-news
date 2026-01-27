

## Plan: Update Edge Function to Use Custom Domain

### What Needs to Change

The `send-password-reset` edge function currently uses `south-hampshire-news.lovable.app` but should use your custom domain `peacockpixelmedia.co.uk` to match the Supabase Site URL configuration you just updated.

### Changes Required

**File: `supabase/functions/send-password-reset/index.ts`**

| Line | Current Value | New Value |
|------|---------------|-----------|
| 39 | `https://south-hampshire-news.lovable.app` | `https://peacockpixelmedia.co.uk` |
| 134 | `https://south-hampshire-news.lovable.app` (Website link) | `https://peacockpixelmedia.co.uk` |
| 135 | `https://south-hampshire-news.lovable.app/contact` (Contact link) | `https://peacockpixelmedia.co.uk/contact` |

### After the Update

1. The reset link in the email will redirect to `https://peacockpixelmedia.co.uk/reset-password`
2. The email footer links will also point to your custom domain
3. This matches your Supabase Dashboard Site URL configuration

### Remaining Dashboard Configuration

Make sure you also add these **Redirect URLs** in Supabase Dashboard (if not already done):

```
https://peacockpixelmedia.co.uk/**
https://south-hampshire-news.lovable.app/**
https://id-preview--ef3dec02-9a74-46ea-a941-0b415710729a.lovable.app/**
```

### Testing

After I make the code change:
1. Request a new password reset on your production site
2. You should receive only the branded "Discover Magazine" email
3. The reset link should redirect to `https://peacockpixelmedia.co.uk/reset-password`

