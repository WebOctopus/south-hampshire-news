

## Add Leafleting Payment Terms to BookingTerms Component

### Problem
Leafleting bookings/quotes currently show either subscription or fixed-term terms, but leafleting has its own specific payment terms that differ from both.

### Changes

**File: `src/components/dashboard/BookingTerms.tsx`**

1. **Add a new `leafletingTerms` array** with the four specific terms:
   - "Once booking is confirmed, 25% of the full amount is required at time of booking. Payment by debit/credit card."
   - "The remaining 75% is due 10 days prior to the delivery date."
   - "If the booking is made within 10 days of delivery, payment is required in full at the time of booking."
   - "No monthly payment plan or extra discount for payment in full in advance is available."

2. **Add `isLeafleting` check** — detect when `pricingModel === 'leafleting'`.

3. **Add a new AccordionItem** for leafleting terms (value `"leaflet-terms"`) with a "Leaflet Distribution" badge, shown when `isLeafleting || showBoth`.

4. **Hide subscription and fixed-term sections** when `isLeafleting` is true (they should only show for their respective models or when `showBoth`).

5. **Update the accordion default open values** to include `"leaflet-terms"`.

6. **Update the footer note** to handle the leafleting case with appropriate messaging.

### Result
Leafleting bookings and quotes will display the correct 25%/75% deposit terms instead of irrelevant subscription or fixed-term conditions.

