

## Change: Payment Section Labels in Booking Details

### Changes in `src/components/dashboard/BookingDetailsDialog.tsx`

**1. Label text (lines 547-549)**

Change `'Your selected payment method:'` to `'Your selected to pay:'` and `'Select your payment method:'` to `'Select your payment:'`.

**2. Display names for payment options (line 573)**

Instead of showing `option.display_name` directly, map the values contextually:
- "6 Months Full Payment" → "6 months in advance"
- "12 Months Full Payment" → "12 months in advance"
- Keep "Monthly Direct Debit" as-is (or adjust if needed)

Add a small helper inline or above the map:

```typescript
const getPaymentDisplayLabel = (displayName: string) => {
  if (displayName.includes('6 Months')) return '6 months in advance';
  if (displayName.includes('12 Months')) return '12 months in advance';
  return displayName;
};
```

Then use `getPaymentDisplayLabel(option.display_name)` at line 573.

### Files Changed

| File | Change |
|---|---|
| `src/components/dashboard/BookingDetailsDialog.tsx` | Lines 547-549: update label text; Line 573: map display names to "X months in advance" |

