## The bug

In `src/components/dashboard/BookingDetailsDialog.tsx`, the payment radio list (around line 893) computes:

```ts
const baseTotal = booking.final_total || booking.monthly_price;
const totalAmount = calculatePaymentAmount(baseTotal, option, pricingModel, paymentOptions, designFee);
```

For a 3+ Subscription (`pricing_model = 'bogof'`), `calculatePaymentAmount` treats `baseTotal` as the **12‑month campaign cost** and derives the monthly as `baseTotal / 2 / minimum_payments`.

- On `BookingSummaryStep` it is called with `pricingBreakdown.finalTotal` (= `monthly × 12` = £2,856), so monthly = 2856 / 2 / 6 = **£238** ✓
- On the dashboard it is called with `booking.final_total`, which is normalised to `monthly × 6` = £1,428 (see `finalTotalNormaliser` / `SUBSCRIPTION_PAYMENTS = 6`), so monthly = 1428 / 2 / 6 = **£119** ✗

Result: the "Monthly Direct Debit" radio shows half the correct amount and the 12‑months‑in‑advance option is also under‑priced (£1,285 instead of ~£2,570).

## Fix

Presentation‑only change in `src/components/dashboard/BookingDetailsDialog.tsx` — no business logic, no DB writes, no edge functions.

1. When `booking.pricing_model === 'bogof'` (subscription), derive the base total that `calculatePaymentAmount` expects from `booking.monthly_price`:
   ```ts
   const baseTotal =
     booking.pricing_model === 'bogof' && booking.monthly_price
       ? booking.monthly_price * 12
       : (booking.final_total || booking.monthly_price);
   ```
   Apply this in the payment‑radio block (around line 893). This restores parity with `BookingSummaryStep` so monthly renders as £238 and the 12‑month option renders as monthly × 12 × 0.9.

2. Apply the same derivation to the "Monthly Cost / Campaign Cost" line (around line 435) so any selected‑option recalculation there stays consistent.

3. Leave `paymentCalculations.ts`, the normaliser, edge functions, and stored booking values untouched — the amount actually charged by the `create-gocardless-payment` edge function is re‑derived server‑side from `monthly_price` and is already correct.

## Verification

- Open the affected booking in the dashboard and confirm:
  - Monthly Direct Debit shows **£238.00 + VAT** with "Direct Debit will collect £285.60 inc VAT … per month".
  - 12 months in advance shows **~£2,570.40 + VAT** with a 10% saving of ~£285.60.
- Confirm the Campaign Overview "Monthly Cost" still reads **£238.00 + VAT**.
- Spot‑check a non‑bogof (Pay As You Go) booking to confirm its payment options are unchanged.
