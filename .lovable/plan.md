
## Plan: Fix Password Reset Redirect URL Configuration

### Root Cause Analysis

Based on the investigation:

1. **Two emails received**: You got an old "Supabase Auth" email (from before our changes at 2:42 PM) AND our branded Resend email (at 2:52 PM). You likely clicked the old link.

2. **localhost redirect**: The Supabase project's **Site URL** in the Supabase Dashboard is configured to `http://localhost:3000`. When `generateLink()` creates the recovery link, Supabase uses this URL to redirect users after token verification.

3. **Token expired error**: The link you clicked was from the old email, and that token was already invalidated when the new token was generated.

### The Fix

There are **two parts** to this fix:

#### Part 1: Update Supabase Dashboard Configuration (Manual Step Required)

You need to update the **Site URL** and **Redirect URLs** in the Supabase Dashboard:

1. Go to: **Supabase Dashboard > Authentication > URL Configuration**
2. Update **Site URL** from `http://localhost:3000` to:
   ```
   https://south-hampshire-news.lovable.app
   ```
3. Add these to **Redirect URLs** (if not already present):
   ```
   https://south-hampshire-news.lovable.app/**
   https://id-preview--ef3dec02-9a74-46ea-a941-0b415710729a.lovable.app/**
   ```

This ensures that after Supabase verifies the reset token, it redirects to your actual production site instead of localhost.

#### Part 2: Verify Branded Email Was Sent

Check your inbox for an email from **"Discover Magazine"** (not "Supabase Auth"). The branded email should have been sent at 2:52 PM. The logs confirm:
- `Password reset email sent successfully` from Resend
- Email ID: `61ed0be0-5c31-4e1b-a415-2e7433372b23`

If you only see the Supabase Auth email and NOT the Discover Magazine email, let me know and we can investigate further.

### Testing After Configuration Update

After updating the Supabase Dashboard:
1. Request a new password reset from the production site
2. Look for the branded "Discover Magazine" email (ignore any old Supabase Auth emails)
3. Click the reset link - it should now redirect to `https://south-hampshire-news.lovable.app/reset-password`

### Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Redirects to localhost | Supabase Site URL set to localhost:3000 | Update Site URL in Supabase Dashboard |
| Got "Supabase Auth" email | Old email from before fix was deployed | Use the newer "Discover Magazine" email |
| otp_expired error | Clicked expired/old link | Request fresh reset after config update |

### No Code Changes Required

The code changes from the previous implementation are correct. The only remaining step is the **Supabase Dashboard configuration** which must be done manually.
