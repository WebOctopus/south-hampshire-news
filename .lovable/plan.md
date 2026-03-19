

## Reorder Payment Options: Monthly Direct Debit First

### Problem
In the BookingDetailsDialog payment section for 3+ (BOGOF) bookings, the "12 months in advance" option appears above "Monthly Direct Debit". The user wants Monthly Direct Debit listed first.

### Solution

**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

Add a `.sort()` call (matching the pattern already used in `BookingSummaryStep.tsx` and `EditQuoteForm.tsx`) between the `.filter()` and `.map()` on line ~841:

```tsx
.filter(option => 
  !booking.selections?.payment_option_id || option.option_type === booking.selections.payment_option_id
)
.sort((a, b) => {
  const getOrder = (option: any) => {
    if (option.option_type === 'monthly') return 1;
    if (option.display_name?.includes('6 Months')) return 2;
    if (option.display_name?.includes('12 Months')) return 3;
    return 4;
  };
  return getOrder(a) - getOrder(b);
})
.map(option => {
```

This ensures Monthly Direct Debit always appears first, consistent with the calculator and other forms.

### Files to change
- `src/components/dashboard/BookingDetailsDialog.tsx` — add sort before map

