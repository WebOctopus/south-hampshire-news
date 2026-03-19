

## Fix: Saved Quotes Cost Column Shows Wrong Amount

### Problem
Line 1253 in `src/pages/Dashboard.tsx` always displays `quote.monthly_price` for all pricing models. For Pay As You Go and Leafleting quotes, this should show `quote.final_total` (the campaign total), not the monthly price.

### Fix
**File: `src/pages/Dashboard.tsx`** (line 1253)

Change the cost display to be conditional on pricing model:

```tsx
<span className="font-semibold">
  £{(quote.pricing_model === 'bogof' 
    ? quote.monthly_price 
    : quote.final_total
  )?.toFixed(2) || '0.00'}
</span>
```

- **BOGOF**: show `monthly_price` (per month)
- **Pay As You Go / Leafleting**: show `final_total` (campaign total)

One line change in one file.

