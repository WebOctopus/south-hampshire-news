

## Fix: Double VAT on Leafleting Stripe Checkout

### Problem
The leafleting pricing calculator uses `price_with_vat` from the database, so `final_total` for leafleting bookings already includes VAT. The Stripe checkout edge function then adds another 20% VAT on top, resulting in double-taxation.

- Stored `final_total` = £384 (VAT-inclusive)
- 25% deposit = £96
- Edge function adds 20% VAT → £115.20
- **Should be**: ex-VAT £320, deposit £80, + VAT = £96

### Root Cause
`src/lib/leafletingCalculator.ts` line 45 sums `area.price_with_vat`, making `finalTotal` VAT-inclusive. But the Stripe edge function (line 52) assumes all amounts are ex-VAT and adds 20%.

Fixed Term and BOGOF bookings store ex-VAT amounts, so the edge function works correctly for them. Only leafleting is affected.

### Solution

**File: `src/components/dashboard/BookingDetailsDialog.tsx`** (~line 606)

When computing `fullAmount` for the Stripe checkout, check if the booking is leafleting. If so, divide `final_total` by 1.2 to convert back to ex-VAT before passing to Stripe (since the edge function will add VAT).

```
const fullAmount = booking.final_total || booking.monthly_price;
// Leafleting final_total includes VAT already (price_with_vat from DB)
// Stripe edge function adds VAT, so send ex-VAT amount
const exVatAmount = booking.pricing_model === 'leafleting' 
  ? Math.round((fullAmount / 1.2) * 100) / 100 
  : fullAmount;
```

Then use `exVatAmount` for `depositAmount` and `payAmount` calculations, and in the display (`formatPrice(payAmount) + VAT`).

**Also update the edge function product name** to not hardcode "Fixed Term":

**File: `supabase/functions/create-stripe-checkout/index.ts`** (~line 63)

Accept `pricing_model` from the request body and use it in the product name:
```
name: `Advertising Campaign - ${pricing_model === 'leafleting' ? 'Leafleting' : 'Fixed Term'}`
```

### Files Changed
- `src/components/dashboard/BookingDetailsDialog.tsx` — convert leafleting VAT-inclusive amount to ex-VAT before sending to Stripe
- `supabase/functions/create-stripe-checkout/index.ts` — accept pricing_model for dynamic product name

