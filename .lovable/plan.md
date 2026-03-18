

## Fix: Leafleting Quote Email Missing Size, Month, and Leaflet Quantity

### Problem
The email confirmation for leafleting quotes shows empty values for **Leaflet Size**, **Distribution Month Start**, and **Number of Leaflets Required**. Three bugs in `AdvertisingStepForm.tsx` lines 446-468:

1. **Leaflet Size**: Line 446 looks up `campaignData.selectedAdSize` in the magazine `adSizes` array (not `leafletSizes`), so it returns `undefined` → email gets `ad_size: undefined`.
2. **Duration/Month**: Line 447 looks up `campaignData.selectedDuration` in magazine `durations` (not `leafletDurations`), so it returns `undefined` → email gets `duration: undefined`.
3. **Leaflet quantity (circulation)**: The `total_circulation` from `pricingBreakdown` is present, but the edge function template variable `number_of_leaflets` isn't being sent. The edge function uses `total_circulation` for the `{{total_circulation}}` variable but the leaflet email template likely uses `{{number_of_leaflets}}`.

Additionally, the edge function (line 423) tries to get distribution start from `payload.selections?.distributionStartDate`, but the email payload doesn't include `selections` — it's only sent in the webhook call, not the email call.

### Solution

**File: `src/components/AdvertisingStepForm.tsx` (lines 444-477)**

Fix the email payload construction for leafleting quotes to use the correct data sources:

```typescript
// Line 446-448: Use leaflet-specific lookups when pricing model is leafleting
const selectedAdSizeData = selectedPricingModel === 'leafleting'
  ? leafletSizes?.find(a => a.id === campaignData.selectedAdSize)
  : adSizes?.find(a => a.id === campaignData.selectedAdSize);
const selectedDurationData = selectedPricingModel === 'leafleting'
  ? leafletDurations?.find(d => d.id === campaignData.selectedDuration)
  : (durations?.find(d => d.id === campaignData.selectedDuration) || 
     subscriptionDurations?.find(d => d.id === campaignData.selectedDuration));

// Line 459: Use .label for leaflet sizes, .name for ad sizes
ad_size: selectedPricingModel === 'leafleting' 
  ? (selectedAdSizeData as any)?.label 
  : selectedAdSizeData?.name,

// Line 460: Duration name
duration: selectedDurationData?.name,

// Add selections to the email payload so distribution_start resolves
selections: quotePayload.selections,
```

This mirrors the pattern already used correctly in the webhook call (lines 401-411) but was missed for the email call.

### Files Changed
- `src/components/AdvertisingStepForm.tsx` — fix leafleting email payload to use `leafletSizes`/`leafletDurations` and include `selections`

