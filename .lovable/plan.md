

## Change: BookingCard "Total Cost" label → "+ VAT"

### What changes

In `src/components/dashboard/BookingCard.tsx`, line 254:

Change `{getPaymentLabel()}` from returning `'Total Cost'` to `'+ VAT'` for all non-monthly payment types. The price figure on line 252 already shows the ex-VAT amount, so just the label needs updating.

**Specific edit**: In `getPaymentLabel()` (lines 55-69), replace every `'Total Cost'` return with `'+ VAT'`. That covers:
- Line 56: no selected option fallback
- Line 66: lump_sum fallback  
- Line 68: default fallback

### Files changed

| File | Change |
|---|---|
| `src/components/dashboard/BookingCard.tsx` | Replace all `'Total Cost'` returns in `getPaymentLabel()` with `'+ VAT'` |

