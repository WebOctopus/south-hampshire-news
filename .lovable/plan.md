

## Fix: Payment Alert Message Based on Pricing Model

### Problem
The booking card shows "Set up your payment plan to start your advertising campaign" for all unpaid bookings, but this wording is only appropriate for BOGOF (subscription) bookings. For Pay As You Go and Leafleting bookings, "payment plan" is misleading since they pay in full (or deposit) by card.

### Fix
**File: `src/components/dashboard/BookingCard.tsx`** (~line 240)

Change the alert message to be conditional on `booking.pricing_model`:
- **BOGOF**: "Set up your payment plan to start your advertising campaign"
- **Pay As You Go / Leafleting**: "Complete your payment to start your advertising campaign"

```tsx
<AlertDescription className="text-amber-900 font-medium">
  {booking.pricing_model === 'bogof'
    ? 'Set up your payment plan to start your advertising campaign'
    : 'Complete your payment to start your advertising campaign'}
</AlertDescription>
```

One file changed.

