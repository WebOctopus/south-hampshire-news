

## Fix Booking Card: Remove Payment Label & Add Booking Type

**File: `src/components/dashboard/BookingCard.tsx`**

### 1. Remove the sub-label under the price amount

Lines 269-272 (monthly branch) and line 279 (non-monthly branch) show labels like "Monthly Payment" beneath the price. Remove these sub-labels for all cases so only the price + VAT is shown.

- Delete lines 270-272 (the `per month for 6 months minimum` text under monthly)
- Delete line 279 (the `getPaymentLabel()` text under non-monthly)

### 2. Add "Pay As You Go" type label before the booking date

Update the card title (line 202) to prepend the booking type before "Booked ...". Use `getPricingModelDisplay` but update 'fixed' to return 'Pay As You Go' instead of 'Fixed Term' (per branding memory).

Line 155-162: Change `'fixed': return 'Fixed Term'` to `'fixed': return 'Pay As You Go'`.

Line 201-208: Change the title to show e.g. "Pay As You Go — Booked 25 Mar 2026 — Half Page":
```tsx
<CardTitle className="text-lg leading-tight">
  {`${getPricingModelDisplay(booking.pricing_model)} — Booked ${formatDate(booking.created_at).split(',')[0]}`}
  {booking.selections?.ad_size_name && (
    <span className="text-muted-foreground font-normal text-sm ml-2">
      — {booking.selections.ad_size_name}
    </span>
  )}
</CardTitle>
```

