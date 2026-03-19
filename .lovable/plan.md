

## Remove Payment Alert Text from Booking Card

### Change
**File: `src/components/dashboard/BookingCard.tsx`** (lines 233-245)

Remove the entire "Payment Required Alert" block inside `CardContent` that shows the amber alert with "Set up your payment plan..." / "Complete your payment..." text.

```tsx
// Remove this entire block (lines 233-245):
{isPaymentRequired && (
  <Alert className="border-amber-400 bg-amber-50/80 backdrop-blur-sm">
    <CreditCard className="h-4 w-4 text-amber-600" />
    <AlertDescription className="text-amber-900 font-medium">
      {booking.pricing_model === 'bogof'
        ? 'Set up your payment plan to start your advertising campaign'
        : 'Complete your payment to start your advertising campaign'}
    </AlertDescription>
  </Alert>
)}
```

The orange card styling and "Payment Required" badge remain — only the text alert inside the card is removed.

**Files to change:** `src/components/dashboard/BookingCard.tsx`

