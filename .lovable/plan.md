

## Fix: Booking card showing £1,080 instead of £90/month

### Root Cause

In `BookingCard.tsx`, the display amount is calculated via `calculatePaymentAmount()` which depends on the `usePaymentOptions()` query loading first. If payment options haven't loaded yet (or the query fails), the fallback on line 51-53 uses `booking.final_total` (£1,080) instead of the monthly amount.

This contradicts the existing constraint that **stored quote/booking values should be used for display** rather than recalculating independently.

### Fix

In `src/components/dashboard/BookingCard.tsx`, simplify the display logic to use the stored `booking.monthly_price` directly when the selected payment option is "monthly", rather than depending on a recalculation:

**Lines 46-53**: Replace the calculation logic with:
```typescript
const selectedPaymentOptionType = booking.selections?.payment_option_id;

// Use stored monthly_price for monthly option instead of recalculating
const displayAmount = (() => {
  if (selectedPaymentOptionType === 'monthly' && booking.monthly_price) {
    return booking.monthly_price;
  }
  const selectedOption = paymentOptions.find(opt => opt.option_type === selectedPaymentOptionType);
  if (selectedOption && paymentOptions.length > 0) {
    const baseTotal = booking.pricing_breakdown?.baseTotal || booking.final_total || 0;
    const designFee = booking.pricing_breakdown?.designFee || 0;
    return calculatePaymentAmount(baseTotal, selectedOption, booking.pricing_model, paymentOptions, designFee);
  }
  return booking.final_total;
})();
```

**Line 240**: Update the monthly check to use the string type instead of the option object:
```typescript
{selectedPaymentOptionType === 'monthly' ? (
```

This ensures the card always shows £90/month immediately using stored data, without waiting for payment options to load.

### Files Changed

| File | Change |
|---|---|
| `src/components/dashboard/BookingCard.tsx` | Use stored `monthly_price` for monthly display instead of recalculating |

