

## Fix Leafleting Payment Section in Create Booking Form

### Problem
The Create Booking form for Leafleting incorrectly displays the generic payment options (Monthly Direct Debit, 12 Months Full Payment) from the database. Leafleting uses a fixed payment structure: 25% deposit at booking, 75% balance due before distribution. The prices shown are also wrong because they're calculated using the BOGOF/fixed-term payment logic.

### Changes

**File: `src/components/dashboard/CreateBookingForm.tsx`**

1. **Replace the Payment Options card for leafleting** with a static payment terms display:
   - Remove the radio group payment option selector when `pricingModel === 'leafleting'`
   - Instead show a simple info card stating:
     - "25% deposit due at the time of booking"
     - "75% balance due before distribution"
   - Auto-set `selectedPaymentOption` to a default value (e.g. `'deposit_25_75'`) when leafleting is selected so form validation passes without requiring user selection

2. **Keep the Amazing Value section** showing "Only £X.XX per 1,000 homes reached" — this stays unchanged.

3. **Keep the Total Campaign Cost and Total Circulation summary** lines.

4. **Update `isFormValid()`** for leafleting to not require `hasPaymentOption` from the radio group, since the payment method is fixed (or auto-set it).

### Result
Leafleting bookings will show clear 25%/75% payment terms instead of irrelevant monthly/annual payment options, matching the existing Leaflet Service calculator behavior.

