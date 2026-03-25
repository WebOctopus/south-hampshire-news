

## Fix Leafleting Quote Email: Total Cost & Add Price Breakdown

### Problems
1. **Unresolved variable**: The email template uses `{{number_of_leaflets}}` but the Edge Function maps to `quantity_of_leaflets` — so the template shows the raw placeholder text
2. **Incorrect total**: `total_cost` displays £253.75 (the 25% deposit) instead of the full campaign cost
3. **No breakdown**: The email should show Campaign Cost, 25% Deposit, and 75% Remaining balance

### Changes

**File: `supabase/functions/send-booking-confirmation-email/index.ts`**

1. **Add `number_of_leaflets` variable** (line ~434): Add a duplicate mapping so the template variable `{{number_of_leaflets}}` resolves correctly alongside the existing `quantity_of_leaflets`:
   ```
   number_of_leaflets: payload.total_circulation ? payload.total_circulation.toLocaleString() : "N/A",
   ```

2. **Add leafleting payment breakdown variables** (lines ~435-437): For leafleting quotes/bookings, compute and expose deposit and remaining amounts:
   ```
   deposit_amount: formatCurrency(payload.final_total ? payload.final_total * 0.25 : 0),
   remaining_amount: formatCurrency(payload.final_total ? payload.final_total * 0.75 : 0),
   payment_terms: payload.pricing_model === 'leafleting'
     ? '25% deposit to secure your slot, 75% balance due 10 days before distribution'
     : '',
   ```

3. **Ensure `total_cost` shows the full campaign cost**: Verify the `final_total` passed from the client is the full price (not the deposit). From the calculator code, `pricingBreakdown.finalTotal` IS the full campaign cost. If the stored value has been overwritten elsewhere (e.g. during booking conversion to the deposit amount), add a fallback using `pricing_breakdown.finalTotal` from the payload.

After deploying, the admin can update the email template in the Email Templates management to include the new variables like `{{deposit_amount}}` and `{{remaining_amount}}`.

### Expected Result
The leafleting quote email will show:
- **Number of Leaflets Required**: resolved value (e.g. "11,300") instead of `{{number_of_leaflets}}`
- **Total Cost + VAT**: full campaign cost (e.g. £508.00)
- New template variables available: `{{deposit_amount}}`, `{{remaining_amount}}`, `{{payment_terms}}`

### Deployment
Edge Function must be redeployed after changes.

