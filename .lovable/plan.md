
## Goal

Across the on-screen Booking Summary and all 9 booking/quote confirmation email templates, the cost block must read top-to-bottom as:

1. **Campaign Cost excluding VAT** — pre-discount subtotal
2. **Discount code applied: {{discount_code}} = −{{discount_amount}}** — only when a code was used (entire row hidden otherwise)
3. **Total Cost excluding VAT** — bold headline = final discounted amount actually charged (`final_total`)

Remove the legacy "Discount (if applicable): None" row everywhere.

## Changes

### 1. Edge function — `supabase/functions/send-booking-confirmation-email/index.ts`

- Add a new variable `subtotal_excl_vat` populated as:
  - `final_total + discount_amount` when a discount code was used
  - `final_total` (same as Total Cost) when no code
- Continue populating `discount_code` / `discount_amount` from the stored discount block (already wired). When empty, the `DISCOUNT_LINE_START/END` marker block is stripped (already implemented).
- No change to `final_total` — it remains the charged figure and maps to `{{total_cost}}`.

### 2. Email templates (DB `email_templates.html_body`, via insert tool)

For each of the 9 templates (`booking_bogof_customer`, `booking_confirmation_customer`, `booking_fixed_customer`, `booking_leafleting_customer`, `quote_bogof_customer`, `quote_fixed_customer`, `quote_leafleting_customer`, `quote_saved_customer`, `booking_quote_admin`):

- Replace the existing total/discount block with the new 3-row order:
  ```
  Campaign Cost excluding VAT          {{subtotal_excl_vat}}
  <!--DISCOUNT_LINE_START-->
  Discount code applied: {{discount_code}}    −{{discount_amount}}
  <!--DISCOUNT_LINE_END-->
  Total Cost excluding VAT  (bold)     {{total_cost}}
  ```
- Delete any legacy "Discount (if applicable): {{duration_discount}}" row.
- Register `subtotal_excl_vat` in `available_variables` for these 9 templates (variables list only — no other content change).

### 3. On-screen Booking Summary

Update the Pricing Summary card in both:
- `src/components/FixedTermBasketSummary.tsx`
- `src/components/LeafletBasketSummary.tsx`

To use the same 3-row order and labels:
- Rename "Cost of This Booking" → **Campaign Cost excluding VAT** (value = pre-discount `finalTotalBeforeDesign || baseTotal`).
- Keep the discount line (only rendered when `discount && discountResult.discountAmount > 0`), labelled **Discount code applied: {code}** with `−£amount`.
- Rename "Subtotal (Excl. VAT)" → **Total Cost excluding VAT** (bold, value = `finalTotal` post-discount). This is the headline.
- VAT row and Incl. VAT row remain underneath unchanged.
- Remove any "Discount (if applicable): None" rendering.

`MobilePricingSummary.tsx` and `ViewQuoteContent.tsx` already show only the final total — confirm and add the discount line above it in the same format if a discount is present, otherwise no change.

## Verification

- Re-send the previously failing BOGOF quote: email must show Campaign Cost > Discount line > bold Total Cost = charged amount.
- Send a quote without a discount code: middle row must be absent; Campaign Cost == Total Cost.
- On-screen Pricing Summary mirrors the same three rows.
