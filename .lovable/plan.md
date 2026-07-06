## Change

Rename the customer-facing "Discount code" terminology to "Voucher code" throughout the booking workflow. Admin screens and internal code (variable names, DB columns, function names, `DiscountCodeInput` component filename) remain unchanged — this is a copy-only change.

## Files to update

- `src/components/DiscountCodeInput.tsx`
  - Label: "Discount code" → "Voucher code"
  - Applied confirmation: "Discount code X applied" → "Voucher code X applied"
- `src/components/FixedTermBasketSummary.tsx` (line 262)
  - "Discount code applied:" → "Voucher code applied:"
- `src/components/LeafletBasketSummary.tsx` (line 357)
  - "Discount code applied:" → "Voucher code applied:"
- `src/components/ContactInformationStep.tsx` (line 687)
  - "Enter your discount code below…" → "Enter your voucher code below…"

## Out of scope

- Admin panel (`DiscountCodesManagement`, `DiscountCodesReporting`) — internal tooling keeps "Discount" naming.
- Existing `VoucherCard` / `VouchersSection` (separate leafleting voucher feature) — unaffected.
- No DB, RPC, or variable renames.
