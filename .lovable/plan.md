

## Fix: GoCardless Payment "Edge Function returned a non-2xx status code"

### Root Cause

All three GoCardless edge functions have outdated CORS headers that are missing Supabase client platform headers. The browser's preflight OPTIONS request is rejected before the function body ever executes, which is why there are zero logs for `create-gocardless-mandate`.

The required but missing headers are: `x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-runtime`, `x-supabase-client-runtime-version`.

### Changes (3 files)

**1. `supabase/functions/create-gocardless-mandate/index.ts`** (line 6)
Update `corsHeaders` to include all Supabase client headers.

**2. `supabase/functions/create-gocardless-payment/index.ts`** (line 6)
Same CORS header fix.

**3. `supabase/functions/complete-gocardless-redirect/index.ts`** (line 6)
Same CORS header fix.

All three get this updated header value:
```
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'
```

No other changes needed. The payment flow logic itself is correct; it just never gets past the CORS preflight.

