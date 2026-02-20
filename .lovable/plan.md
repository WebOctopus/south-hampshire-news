
## Fix Fixed Term Summary Page — Two Changes

### Change 1: Remove "Book Online & Save 10%" Labels

There are two places where this label appears in `src/components/FixedTermBasketSummary.tsx`:

**Occurrence 1 — Line 117** (under the Duration field in the Booking Summary card on the left):
```tsx
<p className="text-xs text-green-600 font-medium mt-1">Book Online & Save 10%</p>
```
This line is removed entirely.

**Occurrence 2 — Line 257** (inside the green savings box in the Pricing Summary on the right):
```tsx
<p className="text-sm font-medium text-green-800">Book Online & Save 10%</p>
<p className="text-2xl font-bold text-green-600">{formatPrice(saving)}</p>
```
The entire `saving > 0` conditional block (lines 254–261) that renders this green savings box is removed.

---

### Change 2: Fix "Cost Per Insert" Calculation

**Current (wrong):**
```ts
const costPerInsert = finalTotal / totalInsertions;
// finalTotal = £759 (includes £55 artwork fee)
// totalInsertions = 4
// result = £189.75 ← WRONG (includes artwork)
```

**Correct:**
```ts
const bookingCostExclDesign = pricingBreakdown?.finalTotalBeforeDesign || finalTotal;
const costPerInsert = bookingCostExclDesign / totalInsertions;
// bookingCostExclDesign = £704 (Cost of This Booking, no artwork)
// totalInsertions = 4
// result = £176.00 ← CORRECT (as shown in the user's annotated image)
```

The `finalTotalBeforeDesign` field is already present on `pricingBreakdown` — it's used on line 208 to display "Cost of This Booking" correctly in the pricing summary. The cost per insert calculation just needs to reference the same value.

---

### Files Changed

- `src/components/FixedTermBasketSummary.tsx` — 3 small edits, no other files touched
- No database changes, no edge function redeployment needed
