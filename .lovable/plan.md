## Goal
At the basket/checkout step, let the customer enter a discount code, validate it via the existing `validate_discount_code` RPC, and apply it to the displayed price before any payment is initiated. Persist the result in booking state so the discounted amount flows naturally into GoCardless / Stripe.

## Where the basket lives
Three sibling summary components, all rendered from `AdvertisingStepForm.tsx`:
- `BookingSummaryStep.tsx` — 3+ Subscription (`bogof`)
- `FixedTermBasketSummary.tsx` — Pay As You Go (`fixed`)
- `LeafletBasketSummary.tsx` — Leaflet Distribution (`leafleting`)

Top-level state lives in `AdvertisingStepForm.campaignData`. The final `monthly_price` / `final_total` written to `bookings` are computed there at booking-creation time.

## Product-type mapping for the RPC
- `fixed` → `fixed_term`
- `bogof` → `subscription`
- `leafleting` → `leaflets`

## Discount application rules
Implemented in a new helper `src/lib/discountCalculations.ts`:

```ts
applyDiscountToTotals({
  productType, // 'subscription' | 'fixed_term' | 'leaflets'
  baseFinalTotal,            // contract total ex-VAT (already includes the 10% upfront if that option is selected, since it's part of campaignCost downstream)
  baseMonthly,               // per-month ex-VAT (subscription only)
  contractMonths,            // subscription only (e.g. 12)
  upfrontPercentageApplied,  // e.g. 10 if the 12-month upfront option is selected
  discount: { discount_type, discount_value, free_item_text }
})
=> { adjustedFinalTotal, adjustedMonthly, discountAmount, lineLabel }
```

Behaviour:
- **percentage**
  - subscription monthly DD: `adjustedMonthly = baseMonthly * (1 - p/100)`; final = adjustedMonthly × contractMonths.
  - subscription 12-month upfront: existing 10% off applies first (already in `baseFinalTotal` from `calculatePaymentAmount`), then `final = baseFinalTotal * (1 - p/100)`. Order of % factors is commutative; we document it as "10% upfront first".
  - short-term / leaflets: `final = baseFinalTotal * (1 - p/100)`.
- **fixed_amount**
  - subscription monthly DD: `adjustedMonthly = baseMonthly - (amount / contractMonths)` (floored at 0); final = adjustedMonthly × contractMonths.
  - subscription 12-month upfront: `final = baseFinalTotal - amount` (the upfront 10% is already baked into `baseFinalTotal`, so the fixed £ comes off the already-discounted total per spec).
  - short-term / leaflets: `final = baseFinalTotal - amount`.
- **free_item**: no price change. Discount amount = 0. Returns `lineLabel = free_item_text`, no other change.

`discountAmount` = `baseFinalTotal − adjustedFinalTotal` (0 for free_item).

## UI: shared component `DiscountCodeInput`
New `src/components/DiscountCodeInput.tsx`:
- Inputs: code field (uppercased on input, `maxLength 32`, zod-validated `z.string().trim().min(1).max(32)`) and Apply button.
- On Apply: call `supabase.rpc('validate_discount_code', { p_code, p_product_type, p_email })`.
- Renders:
  - error message from RPC when `valid:false`
  - success state when `valid:true` (code chip + "Remove" link to clear)
- Props: `productType`, `email`, `currentCode`, `onApplied(result)`, `onCleared()`.

Mounted inside each of the three basket components, just above the totals breakdown.

## State lifted to `AdvertisingStepForm.campaignData`
Add:
```ts
discount: null | {
  code: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_item';
  discount_value: number;
  free_item_text: string | null;
  code_id: string;
}
```
A single `useMemo` derives `{ adjustedFinalTotal, adjustedMonthly, discountAmount, freeItemLabel }` from `pricingBreakdown`, the selected payment option, and `campaignData.discount`. The three basket components receive the adjusted figures via existing props (`pricingBreakdown` is enriched in-place with `adjustedFinalTotal`, `adjustedMonthly`, `discountAmount`, `discount`).

## Display in each basket
- Subtotal row (existing) → unchanged.
- New "Discount (CODE)" row showing `−£X.XX` and a small caption naming the discount type.
- For `free_item`: a "Free item (£0.00)" row with `free_item_text`.
- Final total / monthly amount lines re-render from the adjusted values.

`BookingSummaryStep` payment-option list also uses adjusted figures: per-option `calcPaymentAmount` output is post-processed with `applyDiscountToTotals` so each option shows its discounted £ and the existing "Save £X" badge.

## Persisting into the booking
In `AdvertisingStepForm.tsx` where the booking is inserted (line ~917) and where the quote is inserted (lines ~403, ~742):
- Use the adjusted figures for `monthly_price` and `final_total` (so server-side `create-gocardless-payment` charges the discounted amount — it re-reads these columns; no edge-function change needed).
- Add `discount` block into `pricing_breakdown` JSON: `{ code, code_id, discount_type, discount_value, discount_amount, free_item_text, base_final_total, base_monthly }`.
- Also mirror into `selections.discount` for easy webhook access.
- After successful booking insert, call `supabase.rpc('record_discount_redemption', { ... })` (best-effort; failures logged, do not block payment flow).

## Free-item line in quote + booking confirmation
- Quote save: already serialises `pricing_breakdown` — the discount block makes it through unchanged.
- `send-booking-confirmation-email` and `send-booking-webhook` already read `pricing_breakdown` / booking row; add a small "Free item" line rendered when `pricing_breakdown.discount?.discount_type === 'free_item'`, plus a single "Discount (CODE): −£X.XX" line for other types. Minimal templating change inside the two edge functions.

## Files to add / edit
- **add** `src/lib/discountCalculations.ts` — pure helper + types.
- **add** `src/components/DiscountCodeInput.tsx` — UI + RPC call.
- **edit** `src/components/AdvertisingStepForm.tsx` — `campaignData.discount`, derive adjusted totals, write discounted values + discount block into quote/booking inserts, call `record_discount_redemption` after booking insert.
- **edit** `src/components/BookingSummaryStep.tsx` — render `DiscountCodeInput`, use adjusted totals for the option list + summary, add discount/free-item line.
- **edit** `src/components/FixedTermBasketSummary.tsx` — same.
- **edit** `src/components/LeafletBasketSummary.tsx` — same.
- **edit** `supabase/functions/send-booking-confirmation-email/index.ts` — render discount/free-item line from `pricing_breakdown.discount`.
- **edit** `supabase/functions/send-booking-webhook/index.ts` — include discount block in outbound payload.

## Out of scope (not changing)
- `validate_discount_code`, `record_discount_redemption`, `discount_codes` schema — already exist.
- `create-gocardless-payment`, `create-stripe-checkout`, `create-gocardless-mandate` — discounts flow through naturally because the server re-reads `monthly_price` / `final_total`.
- VAT rules, BOGOF eligibility, payment-option logic.