

## Plan: Divide Rate Card Calculator Pricing by 2 (Per-Issue to Monthly)

### Current Behavior

The Interactive Rate Card Calculator currently displays the **per-issue** price from the database's `subscription_pricing_per_issue` column:

| Ad Size | Areas | Current Display | Expected (÷2) |
|---------|-------|-----------------|---------------|
| 1/4 Page | 2 | £180 | £90 |
| 1/4 Page | 3 | £258 | £129 |
| Full Page | 2 | £476 | £238 |

Since the magazine is published **bi-monthly** (every 2 months), the monthly cost is half the per-issue cost.

### Technical Changes

**File: `src/components/QuickQuoteCalculator.tsx`**

Update the `monthlyPrice` calculation (around lines 67-83) to divide the result by 2:

| Line | Current | Change |
|------|---------|--------|
| 76 | `return subscriptionPricing[priceKey];` | `return subscriptionPricing[priceKey] / 2;` |
| 82 | `return DEFAULT_PRICING[adSizeName]?.[numberOfAreas] \|\| 90;` | `return (DEFAULT_PRICING[adSizeName]?.[numberOfAreas] \|\| 180) / 2;` |

The `sixMonthTotal` calculation (line 86-88) will automatically use the updated monthly price, so:
- Monthly: `£180 / 2 = £90`
- 6-Month: `£90 × 6 = £540`

### Code Change

```typescript
// Get subscription pricing - use DB if available, else defaults for instant display
const monthlyPrice = useMemo(() => {
  const adSizeName = AD_SIZE_OPTIONS[adSizeIndex].name;
  
  // Try database values first
  if (selectedAdSize?.subscription_pricing_per_issue) {
    const subscriptionPricing = selectedAdSize.subscription_pricing_per_issue;
    if (typeof subscriptionPricing === 'object') {
      const priceKey = numberOfAreas.toString();
      if (subscriptionPricing[priceKey]) {
        // Divide by 2 to convert per-issue to monthly (bi-monthly magazine)
        return subscriptionPricing[priceKey] / 2;
      }
    }
  }
  
  // Use hardcoded defaults for instant display, divided by 2 for monthly
  return (DEFAULT_PRICING[adSizeName]?.[numberOfAreas] || 180) / 2;
}, [selectedAdSize, adSizeIndex, numberOfAreas]);
```

### Expected Results After Fix

| Ad Size | Areas | Per-Issue (DB) | Monthly (Display) | 6-Month Total |
|---------|-------|----------------|-------------------|---------------|
| 1/4 Page | 2 | £180 | £90 | £540 |
| 1/4 Page | 3 | £258 | £129 | £774 |
| 1/2 Page | 2 | £288 | £144 | £864 |
| Full Page | 2 | £476 | £238 | £1,428 |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/QuickQuoteCalculator.tsx` | Divide pricing by 2 in the `monthlyPrice` useMemo calculation |

