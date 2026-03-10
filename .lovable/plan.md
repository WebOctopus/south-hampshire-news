

## Save Distribution Start Date to Dedicated Column

### Problem
The `distribution_start_date` column exists in the database and ViewQuoteContent displays it, but it's never populated when saving quotes. The start date is stored only inside the `selections` JSON blob.

### Changes

**`src/components/AdvertisingStepForm.tsx`** (two quote insert payloads, ~line 340 and ~line 631):
- Add `distribution_start_date` to both quote payloads, derived from `campaignData.selectedStartingIssue` or the first value in `campaignData.selectedMonths`
- Format: the value is already a `YYYY-MM` string; append `-01` to make it a valid date, or store as-is if the column accepts text

**`src/components/dashboard/CreateBookingForm.tsx`** (~line 181):
- Add `distribution_start_date` to the quote payload, derived from `selectedMonths` (first selected month) or the starting issue selection
- Same derivation logic: take the first month value from `selectedMonths` or `selectedStartingIssue`

### Derivation logic (all three locations)
```ts
distribution_start_date: campaignData.selectedStartingIssue 
  || (Object.values(campaignData.selectedMonths || {})[0]?.[0]) 
  || null
```

This ensures that all new quotes will have `distribution_start_date` populated and visible in the View Quote dialog. Existing quotes without this field will simply not show the row (the conditional rendering already handles that).

