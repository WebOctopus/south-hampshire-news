

## Fix: Resolve Area UUIDs to Names in Quote/Booking Emails

### Problem
The webhook calls use `resolveWebhookPayload()` to convert area UUIDs to human-readable names, but the email calls send raw UUIDs for `selected_areas`, `bogof_paid_areas`, and `bogof_free_areas`. This means customers receive emails with UUIDs like `ac09feed-d807-4d98-...` instead of area names like "Eastleigh" or "Winchester".

### Root Cause
Four email invocation points pass raw UUID arrays directly instead of resolving them to area names first:
1. `AdvertisingStepForm.tsx` — quote email (~line 449-451)
2. `AdvertisingStepForm.tsx` — booking email (~line 863-865)
3. `CreateBookingForm.tsx` — quote email (~line 275-277)
4. `CreateBookingForm.tsx` — booking email (~line 407-409)

### Solution
Create a small helper function to resolve area IDs to names, and use it in all four email call sites. The `areas` lookup data is already available in scope at each location.

**New helper** (added near top of each file or as a shared util):
```typescript
const resolveAreaNames = (ids: string[], areas: any[]) =>
  ids.map(id => areas?.find(a => a.id === id)?.name || id);
```

**Changes in `AdvertisingStepForm.tsx`** (2 email calls):
- Replace `selected_areas: effectiveSelectedAreas` with `selected_areas: resolveAreaNames(effectiveSelectedAreas, areas || [])`
- Replace `bogof_paid_areas: campaignData.bogofPaidAreas || []` with `bogof_paid_areas: resolveAreaNames(campaignData.bogofPaidAreas || [], areas || [])`
- Replace `bogof_free_areas: campaignData.bogofFreeAreas || []` with `bogof_free_areas: resolveAreaNames(campaignData.bogofFreeAreas || [], areas || [])`

**Changes in `CreateBookingForm.tsx`** (2 email calls):
- Same pattern — resolve all three area arrays using the `areas` lookup before passing to the email function.

No changes needed to the edge function itself — it already displays these values as-is.

