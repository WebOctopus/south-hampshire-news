

## Fix: BOGOF Pricing Bug in Dashboard + Returning Customer Notice

### Issues Found

**1. CreateBookingForm BOGOF pricing bug (confirmed code bug)**
In `src/components/dashboard/CreateBookingForm.tsx` line 133-134, the pricing calculation combines paid AND free areas:
```javascript
const areasToUse = pricingModel === 'bogof' 
  ? [...bogofPaidAreas, ...bogofFreeAreas]  // BUG: includes free areas
  : selectedAreas;
```
This means for a 3+3 BOGOF, the system looks up pricing for 6 areas instead of 3. For any BOGOF booking created via the dashboard "Create Booking" form, pricing will be inflated. A 1+1 Half Page would show £144/month (using the 2-area price of £288) instead of £77/month (using the 1-area price of £154).

**2. Returning Customer Notice showing unnecessarily**
In `CreateBookingForm.tsx` lines 95-105, any user with a previous BOGOF booking or quote gets flagged as a returning customer, even when the admin is creating on their behalf. The notice blocks the BOGOF option selection flow.

### Changes

**`src/components/dashboard/CreateBookingForm.tsx`**:
1. **Line 133-134**: Change BOGOF `areasToUse` to use only `bogofPaidAreas` (not combined with free). Pass `bogofFreeAreas` as the separate `freeAreaIds` parameter for circulation calculation only.
2. **Lines 95-105**: Add admin check so the returning customer notice only shows for customer-facing views, not when an admin is managing bookings.

### No other files affected
The main calculator (AdvertisingStepForm, AdvertisementSizeStep, Advertising.tsx) correctly uses only `bogofPaidAreas` for BOGOF pricing. The stored data for Paul Dollery's quote/booking is correct at £77. This fix ensures the dashboard CreateBookingForm matches the calculator's correct logic.

