

## Update Design Fees: Fixed = £95, 3+ Subscription = £45

Currently the database has a single `design_fee` column per ad size. To support different fees per pricing model, we need to add a new column and update the logic everywhere it's consumed.

### Database Change

**New migration**: Add `design_fee_subscription` column to `ad_sizes` table, defaulting to 45.

```sql
ALTER TABLE ad_sizes ADD COLUMN design_fee_subscription numeric DEFAULT 45 NOT NULL;
-- Update existing design_fee to 95 for fixed
UPDATE ad_sizes SET design_fee = 95, design_fee_subscription = 45;
```

### Files to Update

1. **`src/integrations/supabase/types.ts`** — Add `design_fee_subscription: number` to Row/Insert/Update types for `ad_sizes`.

2. **`src/components/AdvertisingStepForm.tsx`** (line 142) — Pick the correct fee based on pricing model:
   ```tsx
   const designFee = selectedPricingModel === 'bogof' 
     ? (selectedSize as any)?.design_fee_subscription || 45
     : (selectedSize as any)?.design_fee || 95;
   ```
   Also add `selectedPricingModel` to the effect dependency array so the fee updates when switching models.

3. **`src/components/dashboard/CreateBookingForm.tsx`** (line 156-160) — Same logic: choose fee based on current pricing model selection.

4. **`src/components/admin/AdvertSizesPricingManagement.tsx`** — Add a second input field for "Subscription Design Fee" alongside the existing "Artwork Design Fee" field. Update form state and save logic to include `design_fee_subscription`.

5. **`src/components/DesignFeeStep.tsx`** — No changes needed; it already receives `designFee` as a prop and displays it dynamically.

### What stays the same
- All payment calculation logic (`paymentCalculations.ts`) — unchanged, it already works with whatever design fee value is passed in.
- Booking summary, booking card, and quote displays — unchanged, they consume the already-calculated totals.

