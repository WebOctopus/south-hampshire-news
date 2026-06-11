## Goal

Normalise `final_total` so that for **subscription** pricing models (currently only `bogof`) it equals `monthly_price × minimum_payments` (default 6) at every quote/booking write site. `fixed` / Pay-As-You-Go, `fixed_term`, and `leafleting` are priced per issue — the calculator's `finalTotal` is correct and left untouched.

The 11:33 broken booking came through `AdvertisingStepForm` L870 (direct insert, never patched in round 1). Verified — only `AdvertisingStepForm` (direct) and `Dashboard.handleTermsConfirm` (conversion) create `bookings` rows in the codebase.

## 1. Shared helper

`src/lib/finalTotalNormaliser.ts` (frontend) and `supabase/functions/_shared/finalTotal.ts` (mirror):

```ts
export const SUBSCRIPTION_PAYMENTS = 6;
export const SUBSCRIPTION_MODELS = new Set<string>(['bogof']); // extend here for any future monthly product
export const isSubscriptionModel = (m?: string | null) => !!m && SUBSCRIPTION_MODELS.has(String(m));
export function normaliseFinalTotal({ pricingModel, monthlyPrice, fallbackFinalTotal, minimumPayments }: {
  pricingModel?: string | null; monthlyPrice?: number | null; fallbackFinalTotal?: number | null; minimumPayments?: number;
}) {
  const payments = minimumPayments ?? SUBSCRIPTION_PAYMENTS;
  if (isSubscriptionModel(pricingModel) && Number(monthlyPrice) > 0) {
    return Math.round(Number(monthlyPrice) * payments * 100) / 100;
  }
  return Number(fallbackFinalTotal) || 0;
}
```

For `fixed`/`leafleting` the helper returns the fallback unchanged → no behaviour change for those models, no risk to rows like booking `d3a77152` (3 × £180 = £540).

## 2. Apply helper at every quote / booking write site

Bookings inserts:
- `src/components/AdvertisingStepForm.tsx` L870 (booking insert) and the companion webhook/email payloads at L975, L1016.
- `src/pages/Dashboard.tsx` L763 — replace the inline subscription override with `normaliseFinalTotal(...)`.

Quote inserts/updates (so stored quote values are correct from the start, making conversion safe via any handler):
- `src/components/dashboard/CreateBookingForm.tsx` L259 + companion webhook L311 / email L348; L401 + its downstream payloads.
- `src/components/AdvertisingStepForm.tsx` L373 (+ webhook L435, email L482); L701 (+ webhook L810, email L763).
- `src/pages/Advertising.tsx` L393 (quote_requests), L483, L538, L574, L647, L683 (quote inserts + downstream payloads).
- `src/pages/Dashboard.tsx` L337 (pendingQuote replay).
- `src/components/EditQuoteForm.tsx` L199 (quote update — recompute after `monthly_price` is finalised).
- `src/components/LeafletingCalculator.tsx` L179 — leafleting → helper returns fallback unchanged, no edit needed.

## 3. Quote → booking conversion

`src/pages/Dashboard.tsx` `handleTermsConfirm` (L733) — replace the inline `correctedFinalTotal` with `normaliseFinalTotal(...)` so the helper is the single source of truth.

## 4. Gate Monthly Direct Debit to subscription models

`payment_options` has no `pricing_model` column — `option_type='monthly'` (Monthly Direct Debit, `minimum_payments = 6`) is currently selectable for every model. A `fixed` booking like `d3a77152` would, if Monthly DD were chosen, charge `withVat(£180) = £216/mo × 6` — wrong on both period and total.

Two defences:

**Frontend gate** — add `src/lib/paymentOptionFilters.ts` exporting `filterPaymentOptionsForModel(options, pricingModel)` which drops `option_type === 'monthly'` whenever `!isSubscriptionModel(pricingModel)`. Apply at the two radio-list render sites:
- `src/components/dashboard/CreateBookingForm.tsx` (~L820 `sortedOptions`).
- `src/components/BookingSummaryStep.tsx` (~L597 `paymentOptions.sort(...)`).

**Server guard** — in `supabase/functions/create-gocardless-payment/index.ts`:
1. Widen the booking select to include `pricing_model`:
   ```ts
   .select('id, user_id, monthly_price, final_total, pricing_model')
   ```
2. After fetching `bookingRow`, if `paymentType === 'subscription'` and `bookingRow.pricing_model` is not in the subscription set, return 400 `"Monthly subscription is not available for this booking type"` before any GoCardless API call.

## 5. Backfill migration — written, NOT executed

Write the SQL to `.lovable/backfill-final-total.sql` (plain file, not under `supabase/migrations/` so it does not auto-run). User previews and runs separately via the SQL Editor after code verification.

```sql
-- Backfill: ONLY pricing_model = 'bogof'. Excludes 'fixed' (PAYG, e.g. booking d3a77152).
-- Preview first:
SELECT id, pricing_model, monthly_price, final_total, ROUND(monthly_price * 6, 2) AS corrected
FROM public.bookings
WHERE pricing_model = 'bogof'
  AND monthly_price > 0
  AND (final_total IS NULL OR final_total <> ROUND(monthly_price * 6, 2));

-- Then apply:
UPDATE public.bookings
SET final_total = ROUND(monthly_price * 6, 2)
WHERE pricing_model = 'bogof'
  AND monthly_price IS NOT NULL AND monthly_price > 0
  AND (final_total IS NULL OR final_total <> ROUND(monthly_price * 6, 2));

UPDATE public.quotes
SET final_total = ROUND(monthly_price * 6, 2)
WHERE pricing_model = 'bogof'
  AND monthly_price IS NOT NULL AND monthly_price > 0
  AND (final_total IS NULL OR final_total <> ROUND(monthly_price * 6, 2));
```

## 6. Out of scope (unchanged)

VAT helpers, quote display surfaces, `pricingCalculator.ts`, all leafleting/fixed/fixed_term `final_total` semantics, edge functions that only update payment-status fields.

## Files touched

- new: `src/lib/finalTotalNormaliser.ts`, `src/lib/paymentOptionFilters.ts`, `supabase/functions/_shared/finalTotal.ts`, `.lovable/backfill-final-total.sql`
- edited: `src/components/AdvertisingStepForm.tsx`, `src/pages/Advertising.tsx`, `src/pages/Dashboard.tsx`, `src/components/dashboard/CreateBookingForm.tsx`, `src/components/BookingSummaryStep.tsx`, `src/components/EditQuoteForm.tsx`, `supabase/functions/create-gocardless-payment/index.ts`
