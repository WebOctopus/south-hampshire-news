

## Fix Distribution Start Date in Leafleting Quote Emails

### Problem
The `{{distribution_start}}` variable shows "N/A" in leafleting emails because:
- The Edge Function resolves it from `selections.distributionStartDate` (doesn't exist) or `selections.selectedStartingIssue` (not set for leafleting)
- The actual date is stored in the `distribution_start_date` top-level DB column but is never passed to the email function

### Fix

**File: `supabase/functions/send-booking-confirmation-email/index.ts`** (line ~436)

Update the `distribution_start` resolution to also check `payload.distribution_start_date` (the top-level column value) and format it as a readable month/year:

```typescript
distribution_start: (() => {
  const raw = payload.selections?.distributionStartDate 
    || payload.selections?.selectedStartingIssue 
    || payload.distribution_start_date;
  if (!raw || raw === "N/A") return "N/A";
  try {
    const d = new Date(raw);
    return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  } catch { return raw; }
})(),
```

**File: `src/components/AdvertisingStepForm.tsx`** (email invoke calls ~line 454 and ~878)

Add `distribution_start_date` to the email payload body so the Edge Function receives it:

```typescript
distribution_start_date: quotePayload.distribution_start_date,
```

Same change needed in `src/pages/Advertising.tsx` and `src/components/dashboard/CreateBookingForm.tsx` email invoke calls.

**Redeploy** the Edge Function after changes.

### Expected Result
The email will show "Distribution Month Start: March 2026" instead of "N/A".

