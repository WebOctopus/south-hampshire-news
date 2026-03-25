

## Three Changes to Dashboard Bookings Section

### 1. Remove the "Payment Required" banner (red box area)
**File: `src/pages/Dashboard.tsx`** (lines 1357-1393)

Delete the entire "Payment Required Banner" block. Once terms are accepted and the booking is created, users land directly in the bookings list — the banner is redundant since the booking card itself already shows the payment status.

### 2. Change "Payment Required" to "Payment Setup Required" on booking cards
**File: `src/components/dashboard/BookingCard.tsx`** (lines 143-152)

Update `getPaymentStatusLabel`:
- `'Payment Required'` → `'Payment Setup Required'` (both occurrences)

### 3. Add "+ VAT" to the price display on booking cards
**File: `src/components/dashboard/BookingCard.tsx`** (line 274)

In the non-monthly branch, change:
```
{formatPrice(displayAmount)}
```
to:
```
{formatPrice(displayAmount)} + VAT
```

Also update `getPaymentLabel` (line 76) to remove the redundant `'+ VAT'` from the label since it's now on the price itself — change to `'Monthly Payment'` or appropriate descriptor.

