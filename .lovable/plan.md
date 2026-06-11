## Fix

In `src/components/dashboard/ViewQuoteContent.tsx` (BOGOF branch, ~lines 180–195), replace the computed total `6 * monthly_price * paidAreas.length` with the stored `quote.final_total`. `monthly_price` is already the all-areas figure.

Before:
```
<Label>6 payments (minimum)</Label>
<p>{formatPrice(6 * monthly_price * (paidAreas.length || 1))} + VAT</p>
<p>(6 × {formatPrice(monthly_price * (paidAreas.length || 1))} per month)</p>
```

After:
```
<Label>6 payments (minimum)</Label>
<p>{formatPrice(quote.final_total || 0)} + VAT</p>
<p>(6 × {formatPrice(quote.monthly_price || 0)} per month)</p>
```

## Audit results

Searched all `.ts`/`.tsx` for the same `monthly_price × area-count` pattern:
- `ViewQuoteContent.tsx` — only offending site.
- `BookingDetailsDialog.tsx` — already uses stored `final_total` / `monthly_price` directly. No change.
- Quote/booking emails, webhook payload resolver, CRM payload builder — pass through stored `monthly_price` and `final_total` unchanged. No change.

## Out of scope

No changes to stored values, `finalTotalNormaliser`, edge functions, or VAT helpers.
