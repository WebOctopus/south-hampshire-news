

## Fix: "Error Creating Account" when admin creates on behalf of customer

### Root Causes Found

**1. Edge function `getClaims()` may be failing silently** (returns 401 with no error log)
The function uses `anonClient.auth.getClaims(token)` which may not be available or may fail on the esm.sh version of supabase-js. When it fails, it returns 401 immediately (lines 35-40) with no `console.error`, explaining why the logs show only "booted" with no error messages.

**2. Client reads wrong response field**
The edge function returns `{ user_id: "..." }` (line 261), but the client reads `createResult?.user?.id` (line 306). This would always be `undefined` even if the function succeeded.

**3. CORS headers incomplete**
The edge function only allows `authorization, x-client-info, apikey, content-type` but the Supabase client sends additional platform headers that need to be allowed.

### Fix (2 files)

**`supabase/functions/admin-manage-user/index.ts`**
- Update CORS headers to include all Supabase client headers
- Replace `getClaims(token)` with `getUser()` which is more reliable and universally available
- Add `console.error` logging before 401/403 returns for easier future debugging
- Return `user` object with `id` field in `create_user` response for client compatibility

**`src/components/AdvertisingStepForm.tsx`**
- Fix response field access: change `createResult?.user?.id` to `createResult?.user_id || createResult?.user?.id` (both save and book handlers, ~2 locations)

