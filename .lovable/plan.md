

## Fix: Webhook Still Sending Old Format

### Root Causes

**Issue 1: Edge function not deployed.** The edge function code was updated to a thin pass-through proxy in the repo, but the old version is still running on Supabase. The old deployed version likely reshapes/wraps the payload, undoing the client-side cleanup. We need to **deploy the updated edge function**.

**Issue 2: Schedule month not human-readable.** The `buildScheduleArray` in `webhookPayloadResolver.ts` passes through `s.month` as-is (e.g. `"2026-02"`). It should format this to `"February 2026"`. The `copy_deadline` and `delivery_date` are already formatted, but the `month` field was missed.

### Changes

#### 1. Deploy the edge function

Deploy `send-quote-booking-webhook` so the updated thin-proxy code goes live. This is the main fix -- without it, the old server-side function continues to reshape the payload.

#### 2. Fix month formatting in `src/lib/webhookPayloadResolver.ts`

In `buildScheduleArray`, change the `month` field mapping from:
```
month: s.month || s.label || ''
```
to parse `s.month` (which comes as `"2026-02"` or month names like `"February"`) and format it as `"February 2026"`:
```
month: formatMonthHuman(s.month, s.year) || s.label || ''
```

Add a small helper `formatMonthHuman` that:
- Handles `"YYYY-MM"` format (e.g. `"2026-02"` becomes `"February 2026"`)
- Handles plain month names (e.g. `"February"`) by appending the year from `s.year` if available
- Falls back to the raw string if it can't parse

### Files Changed

| File | Change |
|---|---|
| `src/lib/webhookPayloadResolver.ts` | Add `formatMonthHuman` helper; update `buildScheduleArray` to use it |
| `supabase/functions/send-quote-booking-webhook/index.ts` | **Deploy** (no code change -- code is already correct) |

