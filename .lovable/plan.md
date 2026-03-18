

## Fix: Fixed Term Quote — Remove "per month" from List and Show Only Final Total in View

### Changes

**1. `src/pages/Dashboard.tsx` (line ~1255)**
In the saved quotes table, the sub-label currently shows "per month" for both BOGOF and Fixed Term. Update the condition to also check for `fixed_term`/`fixed`, showing "campaign total" for Fixed Term (same as leafleting), and "per month" only for BOGOF.

```
{quote.pricing_model === 'bogof' ? 'per month' : 'campaign total'}
```

**2. `src/components/dashboard/ViewQuoteContent.tsx` (lines 127-135)**
For Fixed Term quotes, remove the "Monthly Price" row and only show "Final Total" as a single price field (not in a 2-column grid). For BOGOF, keep both Monthly Price and Final Total. Logic:

- If `quote.pricing_model === 'fixed' || quote.pricing_model === 'fixed_term'`: show only Final Total as "Price"
- Otherwise: show both Monthly Price and Final Total as today

**3. `src/components/dashboard/QuoteConversionCard.tsx` (lines 145-151)**
Same logic: for Fixed Term, display `quote.final_total` instead of `quote.monthly_price`, and hide the "per month" sub-label. Show "campaign total" instead.

### Files
- `src/pages/Dashboard.tsx`
- `src/components/dashboard/ViewQuoteContent.tsx`
- `src/components/dashboard/QuoteConversionCard.tsx`

