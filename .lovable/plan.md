

## Fix Leafleting Email Data for Bookings and Quotes

### Problem
The leaflet booking/quote confirmation email has multiple unresolved template variables (visible in the screenshot as raw `{{number_of_deliveries_per_area}}` and `{{quantity_of_leaflets}}`). The root causes are in both the client-side email payloads and the Edge Function variable mapping.

### Issues Found

1. **Edge function missing template variables**: `number_of_deliveries_per_area` and `quantity_of_leaflets` are never mapped in the vars object (line 430-433 of `send-booking-confirmation-email/index.ts`)
2. **Wrong lookups in CreateBookingForm**: For leafleting, `ad_size` resolves from `adSizes` (ad_sizes table) instead of `leafletSizes`, and `duration` from `durations` instead of `leafletDurations` -- both return undefined for leaflet IDs
3. **Missing selections data**: The email payloads from CreateBookingForm don't include leaflet-specific fields needed by the edge function (e.g., `distributionStartDate`, `leafletSize` label)

### Changes

**File 1: `supabase/functions/send-booking-confirmation-email/index.ts`** (lines 430-433)

Add missing template variable mappings:
- `number_of_deliveries_per_area`: derive from `payload.duration` or `payload.selections?.leafletDuration` (the duration name like "6 Issues")
- `quantity_of_leaflets`: derive from `payload.total_circulation` (total leaflets across all areas)
- Fix `distribution_start` to check multiple possible key names from selections

**File 2: `src/components/dashboard/CreateBookingForm.tsx`**

Fix the **quote email payload** (around line 319-341):
- When `pricingModel === 'leafleting'`, look up size from `leafletSizes` (using `.label`) instead of `adSizes`
- Look up duration from `leafletDurations` (using `.name`) instead of `durations`
- Pass `selections` with leaflet-specific data including `distributionStartDate`

Fix the **booking email payload** (around line 451-472):
- Same leaflet-specific lookups for `ad_size` and `duration`
- Include `selections` object with leaflet data

**File 3: `src/components/AdvertisingStepForm.tsx`** (lines 453-485, 878+)

Verify the quote and booking email payloads also correctly pass leaflet data -- the quote path (line 463) already handles this with conditional logic, but verify the booking path does too.

### Result
All leaflet email template variables (`{{leaflet_size}}`, `{{number_of_deliveries_per_area}}`, `{{quantity_of_leaflets}}`, `{{distribution_start}}`) will resolve to actual values in both booking and quote confirmation emails.

