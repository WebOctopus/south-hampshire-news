## Problem

On the 3+ Subscription (BOGOF) booking confirmation email, the **Committed (contracted) Cost + VAT** row shows £1080 when it should be £540 + VAT.

## Root cause

In `src/components/AdvertisingStepForm.tsx`, the BOGOF pricing breakdown stores `finalTotal` as the **full undiscounted** value (paid areas + matched free areas). The monthly price calc proves this:

```ts
// pricing_model === 'bogof'
monthly_price = finalTotal / 2 / minPayments   // = 1080 / 2 / 6 = £90 ✓
```

So `finalTotal = £1080` represents paid (£540) + free-bonus (£540). The customer's actual contracted commitment is `finalTotal / 2 = £540` (= £90 × 6 instalments).

The email edge function `send-booking-confirmation-email/index.ts` populates the `{{total_cost}}` template variable directly from `pricing_breakdown.finalTotal ?? final_total`, so BOGOF emails show £1080 instead of £540.

Fixed Term and Leafleting are unaffected — for those models `finalTotal` already equals what the customer pays.

## Fix

In `supabase/functions/send-booking-confirmation-email/index.ts`, when `payload.pricing_model === 'bogof'`, compute the committed cost as half of `finalTotal` before assigning it to the `total_cost` template variable.

```ts
const rawFinalTotal = payload.pricing_breakdown?.finalTotal ?? payload.final_total ?? 0;
const committedCost = payload.pricing_model === 'bogof'
  ? rawFinalTotal / 2     // BOGOF stores paid+free; customer only pays half
  : rawFinalTotal;

// then:
total_cost: formatCurrency(committedCost),
deposit_amount: formatCurrency(committedCost * 0.25),   // leafleting only
remaining_amount: formatCurrency(committedCost * 0.75), // leafleting only
```

Leafleting deposit / remaining values continue to use the non-halved total (BOGOF doesn't use them, so no impact there either way — but routing them through `committedCost` keeps the logic consistent because for non-BOGOF `committedCost === rawFinalTotal`).

## Scope

- **Edit**: `supabase/functions/send-booking-confirmation-email/index.ts` only — single derivation added before the template `vars` map (around lines 506–516).
- **Not touched**: `AdvertisingStepForm.tsx`, pricing calculator, DB email templates, webhook payloads, monthly_price logic.

## Verification

After deploy, re-trigger a BOGOF booking matching the screenshot (monthly £90):
- `{{monthly_price}}` → £90.00 (unchanged)
- `{{total_cost}}` → £540.00 (was £1080.00)

Fixed Term and Leafleting confirmation emails should be unchanged.