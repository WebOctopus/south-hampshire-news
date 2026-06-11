## VAT fix for Direct Debit collection & invoicing

All stored figures (`subtotal`, `monthly_price`, `final_total`) remain ex-VAT. VAT (20%) is applied only at the payment layer (GoCardless) and surfaced clearly to customers + on invoices.

### 1. Single VAT source of truth

Create `supabase/functions/_shared/vat.ts`:
```ts
export const VAT_RATE = 0.20;
export const withVat = (net: number) => Math.round(net * (1 + VAT_RATE) * 100) / 100;
export const vatAmount = (net: number) => Math.round(net * VAT_RATE * 100) / 100;
```

Mirror as `src/lib/vat.ts` for the frontend (same constant + helpers). No scattered `× 1.2` literals anywhere.

### 2. `create-gocardless-payment` — charge inc VAT

- Import `VAT_RATE` / `withVat`.
- Subscription path: `subscriptionAmount = withVat(bookingRow.monthly_price)` (e.g. £129 → £154.80). Store the gross amount in `gocardless_subscriptions.amount` (that's what GC actually debits).
- One-off path: re-derive server-side from `bookingRow.final_total` (ignore client `amount`), then `paymentAmount = withVat(finalTotal)`. Store gross in `gocardless_payments.amount`.
- Pass gross amount (in pence) to GoCardless `/subscriptions` and `/payments`.

### 3. Pre-mandate UI — show actual DD amount

Update `BookingDetailsDialog.tsx` (the "Pay now" / payment-options screen the customer sees before being redirected to GoCardless) and `PaymentSetup.tsx` success messaging:

- For monthly: show `£154.80/month inc VAT (£129.00 + £25.80 VAT)`.
- For one-off: show `£928.80 inc VAT (£774.00 + £154.80 VAT)`.
- Use helpers from `src/lib/vat.ts`. Keep all *quote* surfaces (`ViewQuoteContent`, basket summaries, calculator) unchanged — they stay "+ VAT" / ex-VAT.

Affected files (UI labels only): `src/components/dashboard/BookingDetailsDialog.tsx` (payment options block ~L884-910, "Direct Debit Setup Complete" block ~L670-700), and the toast/message in `src/pages/PaymentSetup.tsx`.

### 4. `generate-invoice` — proper VAT breakdown

Schema additions (one migration):

- `invoices`: add `net_amount numeric`, `vat_rate numeric default 0.20`, `vat_amount numeric`, `gross_amount numeric`. Keep `amount` for back-compat (= gross).
- `site_settings` (or a constant) — add `vat_registration_number text` so the number is editable later. Placeholder value `'GB000000000'` for now.

Edge function changes (`supabase/functions/generate-invoice/index.ts`):

- Compute `net = booking.monthly_price` (subscription) or `booking.final_total` (one-off), then `vat = vatAmount(net)`, `gross = withVat(net)`. Insert all four columns; `amount` mirrors `gross` for back-compat.
- PDF additions in `generateInvoicePdf`:
  - Header block: add "VAT Reg No: {vat_registration_number}" under company name.
  - Totals block: replace single "Total" line with:
    ```
    Subtotal (ex VAT):   £129.00
    VAT @ 20%:           £25.80
    Total (inc VAT):     £154.80
    ```
  - For subscription invoices, label as "Monthly Total (inc VAT)".
  - Update the Campaign Details row amount to show the ex-VAT subtotal (unchanged value, clearer label).

### 5. Out of scope (explicitly unchanged)

- Quote display, `pricingCalculator.ts`, `ViewQuoteContent.tsx`, basket summaries, calculator UI.
- `bookings.subtotal`, `bookings.monthly_price`, `bookings.final_total` storage (still ex-VAT).
- `complete-gocardless-redirect`, `gocardless-webhook` logic (they don't touch amounts).

### Migration summary

- Add `net_amount`, `vat_rate`, `vat_amount`, `gross_amount` columns to `public.invoices` (nullable for historical rows).
- Add `vat_registration_number` row to `site_settings` (or a column on a settings table — will confirm exact location when implementing).
