## Goal

The "Yes, design my artwork" choice on the booking calculator must stop being added to the customer's online total / monthly payment. The artwork fee is now invoiced manually by admin after the booking. The Yes/No question, the displayed fee amount, and the choice flowing into bookings/webhooks all stay — only the addition to the chargeable total is removed.

## Changes

### 1. `src/components/AdvertisingStepForm.tsx` (pricing effect)
The effect at ~lines 154–200 currently adds `designFee` into `pricingBreakdown.finalTotal` whenever `needsDesign` is true. Change it so the fee is no longer rolled into the chargeable total:
- Keep `needsDesign` and `designFee` in `campaignData` state so the choice and the fee value still flow through to webhooks/CRM and to the summary UI.
- Stop mutating `pricingBreakdown.finalTotal` / `finalTotalBeforeDesign` based on the design choice. `pricingBreakdown.designFee` itself can still be populated (so summaries can display it as an informational line), but it must NOT be included in `finalTotal` or in any monthly/full-payment derivation.

### 2. `src/lib/paymentCalculations.ts`
`calculatePaymentAmount` currently splits the design fee into the monthly amount and adds the full design fee to full-payment options. Update it to ignore `designFee` entirely when computing what the customer pays online: pass `0` or simply stop adding `designFee` into the returned amounts. The function signature can stay the same to avoid touching call sites.

### 3. `src/components/DesignFeeStep.tsx` (copy only)
Reword the Yes option so customers understand the fee is shown for reference but not charged via the site:
- Remove: "The design fee of £X + VAT will be added to your booking."
- Replace with: "Our design team will contact you after booking and invoice the £X + VAT artwork fee separately — it is not added to your online total."
- Keep the price badge so the amount is still visible.
- No change to the radio behaviour or the "No, finished artwork will be supplied" card.

### 4. Summary components — still show the fee, clearly separated
In `BookingSummaryStep.tsx`, `FixedTermBasketSummary.tsx`, and `MobilePricingSummary.tsx`:
- Keep rendering an "Artwork Design Fee" row when `needsDesign` is true, showing the fee amount + VAT.
- Label it as "Invoiced separately by our team" (small muted note) and ensure it is visually separated from the campaign subtotal/total.
- Ensure the "Total to pay online" / monthly figures do NOT include the artwork fee.
- Remove any `designFeeToShow` math that was grossing the campaign cost up — the fee is presented alongside the total, not inside it.

### 5. Data flow preserved (verify, no functional change)
- `campaignData.needsDesign` and `campaignData.designFee` continue to be passed into booking creation and into `send-booking-webhook` / `send-quote-booking-webhook` payloads so admin sees the customer's choice and the fee to invoice.
- `webhookPayloadResolver.ts` already forwards `pricing_breakdown.designFee` — leave as-is; admin treats it as informational.

## Out of scope
- No changes to the Yes/No question, the artwork upload step, admin-side invoicing UI, or any other pricing logic (BOGOF, durations, discounts).
- No DB/migration changes.

## Verification
- Pick an ad size, toggle Yes/No on the artwork step: the "Total to pay online" and monthly amount stay identical between the two choices.
- When Yes is selected, the summary still shows the artwork fee amount with a clear "Invoiced separately" label, and that figure is NOT added to the online total.
- Completing a booking still records `needsDesign: true` and the `designFee` value in the booking row and webhook payload.
