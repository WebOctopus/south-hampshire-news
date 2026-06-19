## Issue

The discount line in the email templates was correctly inserted and the send function strips/renders it based on `payload.pricing_breakdown.discount`. However, in `src/components/AdvertisingStepForm.tsx`, the email invocation passes the raw `campaignData.pricingBreakdown` — which does **not** include the discount block. The discount is only merged into pricing_breakdown when saving to the DB, not when sending the email payload.

Result: `getDiscountVars()` sees no discount → `stripDiscountLine()` removes the block → the email goes out without the discount line, even though the quote/booking record itself has the discount stored correctly.

Verified against quote `930057c3...` (BOGOF, code "NEW CUSTOMER 30%", £259.20 off) — DB row has the discount block, email was sent successfully but with the discount line stripped.

## Fix

In `src/components/AdvertisingStepForm.tsx`, three `send-booking-confirmation-email` invocations need their `pricing_breakdown` field updated to merge in the already-computed discount block (the same shape used in the DB insert):

1. **Line ~554** (new-user / first-time quote save) — use `quoteDiscountBlock`
2. **Line ~893** (returning-user quote save) — use `returningDiscountBlock`
3. **Line ~1110** (booking creation) — use `bookingDiscountBlock`

Change pattern, in each case:

```ts
pricing_breakdown: campaignData.pricingBreakdown,
```
to:
```ts
pricing_breakdown: { ...(campaignData.pricingBreakdown || {}), discount: <theDiscountBlock> },
```

No other files need changes. No edge function, template, or DB changes — those are already correct.

## Verification

After the change, save a new BOGOF quote with a discount code applied. The customer confirmation email's Quote Summary should include the "Discount code applied: …  −£…" row immediately under Total Cost.
