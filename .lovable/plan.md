

## Fix BOGOF Monthly Cost Showing Campaign Total Instead of Monthly Price

### Problem
On line 406-416 of `BookingDetailsDialog.tsx`, the label correctly says "Monthly Cost" for BOGOF, but the value calculation uses `booking.final_total || booking.monthly_price`. Since `final_total` exists (£576), it displays that instead of the monthly price (£90).

### Fix

**File: `src/components/dashboard/BookingDetailsDialog.tsx` (lines 406-416)**

For BOGOF pricing model, use `booking.monthly_price` directly instead of `booking.final_total || booking.monthly_price`:

```tsx
<span className="font-medium">{booking.pricing_model === 'bogof' ? 'Monthly Cost' : 'Campaign Cost'}:</span>{' '}
<span className="text-muted-foreground font-semibold">
  {(() => {
    if (booking.pricing_model === 'bogof') {
      return formatPrice(booking.monthly_price || 0) + ' + VAT';
    }
    const selectedPaymentOptionId = booking.selections?.payment_option_id;
    const selectedOption = paymentOptions.find(opt => opt.option_type === selectedPaymentOptionId);
    const baseTotal = booking.pricing_breakdown?.baseTotal || booking.final_total || booking.monthly_price;
    const designFee = booking.pricing_breakdown?.designFee || 0;
    if (selectedOption && paymentOptions.length > 0) {
      return formatPrice(calculatePaymentAmount(baseTotal, selectedOption, booking.pricing_model, paymentOptions, designFee)) + ' + VAT';
    }
    return formatPrice(booking.final_total || booking.monthly_price) + ' + VAT';
  })()}
</span>
```

Single file change, single location.

