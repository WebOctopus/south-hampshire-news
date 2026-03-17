

## Fix: BOGOF Booking Card Shows Full Total Instead of Monthly Price

### Problem
When a BOGOF quote is converted to a booking via "View & Accept Terms", the booking's `selections` object has no `payment_option_id` yet (payment plan is chosen later). In `BookingCard.tsx`:

1. `selectedPaymentOptionType` = `undefined` (no payment option chosen yet)
2. Falls through all branches to line 59: `return booking.final_total`
3. `final_total` for BOGOF is the full campaign cost (e.g. monthly × 12), not the monthly amount
4. Label shows "+ VAT" instead of "Monthly Payment"

The card displays the annual total as if it were the price, when it should show `monthly_price` for BOGOF bookings that haven't selected a payment option yet.

### Solution

**File: `src/components/dashboard/BookingCard.tsx`**

Two changes in the `displayAmount` calculation and `getPaymentLabel`:

1. **`displayAmount` (lines 49-60)**: Before the final fallback `return booking.final_total`, add a check: if `booking.pricing_model === 'bogof'` and `booking.monthly_price` exists, return `booking.monthly_price`. This ensures BOGOF bookings default to monthly display even before a payment option is selected.

2. **`getPaymentLabel` (lines 62-71)**: When no `selectedPaymentOptionType` exists but `booking.pricing_model === 'bogof'`, return `'Monthly Payment'` instead of `'+ VAT'`.

This way, BOGOF bookings always default to showing the monthly price on the card, matching user expectations. Non-BOGOF bookings (fixed, leafleting) continue showing `final_total` with "+ VAT".

