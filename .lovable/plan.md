

## Fix: Areas Field Still Verbose in Webhook

### Root Cause

The updated edge function (thin pass-through proxy) was **never successfully deployed** to Supabase. The old version is still running, which restructures the clean client payload back into a verbose format with nested objects and internal metadata.

The client-side code is correct -- `buildCrmWebhookPayload` already strips areas down to just `name`, `ad_size`, `base_price`, and `circulation`. But the old deployed edge function overwrites this.

### Fix

**Deploy the edge function** `send-quote-booking-webhook`. No code changes needed -- the code is already correct in the repo. It just needs to be deployed to Supabase so the new thin-proxy version replaces the old one.

### Files Changed

| File | Change |
|---|---|
| `supabase/functions/send-quote-booking-webhook/index.ts` | **Deploy only** (no code change) |

