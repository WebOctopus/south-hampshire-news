

## Add Ad Size to Quote Details and Saved Quotes Table

### Changes

**1. `src/pages/Dashboard.tsx`** (Saved Quotes table)
- Import `useAdSizes` from `usePricingData` (or query ad_sizes directly)
- Add a new `<th>Ad Size</th>` column between "Campaign Type" and "Cost (+VAT)" (line 1211)
- Add a corresponding `<td>` that resolves `quote.ad_size_id` to the ad size name using the fetched ad sizes data
- For leafleting quotes (no ad_size_id), show "N/A" or dash

**2. `src/components/dashboard/ViewQuoteContent.tsx`** (View Quote dialog)
- Import and use `useAdSizes` to resolve `quote.ad_size_id` into a human-readable name
- Add an "Ad Size" field in the top grid (between Campaign Type/Status and Monthly Price/Final Total)

### Data Resolution
The `ad_sizes` table has `id`, `name`, and `dimensions`. Display format: ad size name (e.g. "Quarter Page") with dimensions as secondary text.

### Hook
Use `useAdSizes` from `usePricingData` which already queries the `ad_sizes` table and is used elsewhere in the app.

