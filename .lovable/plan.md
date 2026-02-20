
## Change Sender Email from noreply@ to discovermagazines@

### What Changes

All outgoing transactional emails currently use:
```
Discover Magazine <noreply@peacockpixelmedia.co.uk>
```

This will be updated to:
```
Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>
```

### Files Affected

**`supabase/functions/send-booking-confirmation-email/index.ts`** — 2 occurrences
- Line ~282: Admin notification email `from` field
- Line ~351: Customer confirmation email `from` field

**`supabase/functions/send-welcome-email/index.ts`** — 1 occurrence
- Line ~144: Welcome email `from` field

**`supabase/functions/send-password-reset/index.ts`** — 1 occurrence
- Line ~61: Password reset email `from` field

### Note on Resend Verification

The domain `peacockpixelmedia.co.uk` is already verified with Resend. As long as `discovermagazines@peacockpixelmedia.co.uk` is a valid mailbox or alias on that domain, Resend will accept it as a sender address with no additional configuration needed. If it is not yet set up as a mailbox/alias, emails will still send but replies won't reach an inbox — worth confirming before deploying.

All 3 edge functions will be redeployed after the change.
