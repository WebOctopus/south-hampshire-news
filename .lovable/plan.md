

## Fix Leafleting Pricing to Show Ex-VAT Amounts

### Problem
The leaflet areas table stores `price_with_vat` (e.g. £498 for Hamble). The calculator uses this value directly as the subtotal/finalTotal, which then gets stored in quotes and displayed with "+ VAT" — effectively double-counting VAT. The quote summary should show the ex-VAT amount (£415.00 for a £498 inc-VAT price).

### Changes

**File 1: `src/lib/leafletingCalculator.ts`**
Convert `price_with_vat` to ex-VAT when calculating subtotals:
- Change subtotal calculation: `area.price_with_vat / 1.2` instead of `area.price_with_vat`
- Change area breakdown `basePrice`: `area.price_with_vat / 1.2`
- This ensures `finalTotal` stored in quotes is ex-VAT, matching magazine ad pricing behavior

**File 2: `src/components/dashboard/ViewQuoteContent.tsx`**
Add a dedicated leafleting pricing section (like fixed-term has):
- Show "Campaign Total" with `formatPrice(quote.final_total) + " + VAT"` — now correct since the stored value will be ex-VAT
- Show leaflet-specific labels

**File 3: `src/components/dashboard/QuoteConversionCard.tsx`**
The card at line 146-154 shows `final_total` for non-BOGOF/non-fixed quotes (which includes leafleting). Since the stored value will now be ex-VAT, this is correct. Add a "campaign total" sub-label for leafleting alongside the existing fixed-term one.

**File 4: `src/components/dashboard/BookingDetailsDialog.tsx`**
Lines 649-653 already convert leafleting `final_total` to ex-VAT before Stripe (`exVatAmount = isLeafleting ? fullAmount / 1.2 : fullAmount`). Since the stored value will now already be ex-VAT, remove this double-conversion to prevent undercharging.

**File 5: `src/components/LeafletingCalculator.tsx`**
Update the public-facing calculator display to show ex-VAT prices with "+ VAT" label instead of showing the raw `price_with_vat` value, ensuring consistency with the quote summary.

### Impact
- All leafleting quotes/bookings will store and display ex-VAT amounts
- "+ VAT" labels will be accurate
- Stripe payments won't double-convert (the Stripe edge function already adds 20% VAT)
- Existing quotes with VAT-inclusive values will display slightly higher than intended until re-quoted

