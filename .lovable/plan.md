

## Fix Leafleting Campaign Overview Pricing Display

### Problem
The leafleting booking stores VAT-inclusive prices as `final_total` (384 + 609 = £993), but the area names in the database show ex-VAT prices ("Southampton - £320 + vat", "Chandler's Ford - £508 + vat"). This creates confusion: the user sees £320 + £508 = £828 in the area names but £993 as the Campaign Cost.

The calculator code (`leafletingCalculator.ts`) has already been fixed to divide by 1.2 and store ex-VAT values, but existing bookings were created before that fix and still have VAT-inclusive data stored.

### Root Cause (from database)
- Southampton: `price_with_vat` = 384, area name shows "£320 + vat" (384/1.2 = 320)
- Chandler's Ford: `price_with_vat` = 609, area name shows "£508 + vat" (609/1.2 = 507.50)
- Stored `final_total` = 993 (sum of VAT-inclusive prices)
- Stored `pricing_breakdown.areaBreakdown[].basePrice` = 384, 609 (also VAT-inclusive)

### Fix

**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

Three changes in the leafleting display logic:

1. **Campaign Cost display (lines 406-420)**: For leafleting bookings, detect whether stored prices are VAT-inclusive by checking if `areaBreakdown` basePrices match the fetched `price_with_vat` values. If they do, divide `final_total` by 1.2 to show the correct ex-VAT campaign cost. For new bookings (where the calculator already stores ex-VAT), no conversion needed.

2. **Per-area prices in area cards (lines 492-507)**: For leafleting bookings, show each area's ex-VAT price next to its name (sourced from `pricing_breakdown.areaBreakdown`, converted if needed). This replaces showing only circulation info, making the breakdown visible.

3. **Deposit and remaining amounts (lines 653-658)**: Derive these from the same corrected ex-VAT campaign cost so the math is consistent: deposit = 25% of ex-VAT total, remaining = 75%.

### Detection Logic
```text
For each leafleting booking:
  - Get areaBreakdown from pricing_breakdown
  - Fetch current price_with_vat for those areas
  - If stored basePrice ≈ price_with_vat → old data, divide by 1.2
  - If stored basePrice ≈ price_with_vat/1.2 → new data, use as-is
```

### Expected Result
For the user's booking (Southampton + Chandler's Ford):
- **Campaign Cost**: £828 + VAT (was showing £993 + VAT)
- Area breakdown: Southampton £320 + VAT, Chandler's Ford £508 + VAT  
- **25% Deposit**: £207.00 + VAT
- **Remaining**: £621.00 + VAT

### Technical Details
- Single file change: `src/components/dashboard/BookingDetailsDialog.tsx`
- The `pricingAreas` query already fetches leaflet area data (line 118-121) but doesn't include `price_with_vat` - will add it to the select
- Uses stored `pricing_breakdown.areaBreakdown` for per-area prices with VAT-inclusive detection fallback
- No database migration needed

