

## Fix ViewQuoteContent for BOGOF Quotes

Four changes to **`src/components/dashboard/ViewQuoteContent.tsx`**:

### 1. Fix Final Total for BOGOF — show monthly payment × paid areas

The stored `monthly_price` is the per-area monthly rate (e.g. £90). The "Final Total" for BOGOF should reflect the total monthly payment across all paid areas:

```
Final Total = monthly_price × number of paid areas
```

So 2 paid areas at £90 = £180 + VAT (not the stored `final_total` of £1,080).

**Change the BOGOF pricing display (lines 133-143)** to:

```tsx
{isBogof ? (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label>Monthly Price (per area)</Label>
      <p className="font-semibold text-lg">{formatPrice(quote.monthly_price || 0)} + VAT</p>
    </div>
    <div>
      <Label>Monthly Payment</Label>
      <p className="font-semibold text-lg">
        {formatPrice((quote.monthly_price || 0) * (paidAreas.length || 1))} + VAT
      </p>
      <p className="text-sm text-muted-foreground">
        ({paidAreas.length} area{paidAreas.length !== 1 ? 's' : ''} × {formatPrice(quote.monthly_price || 0)})
      </p>
    </div>
  </div>
) : quote.pricing_model === 'fixed' || quote.pricing_model === 'fixed_term' ? (
  // existing fixed pricing display
) : (
  // existing other pricing display
)}
```

### 2. Remove Distribution Start Date section
Delete the `distribution_start_date` block (lines 151-159).

### 3. Rename "Paid Areas" → "Subscribed Areas (minimum 3 issues)"
Line 173.

### 4. Rename "FREE Bonus Areas" → "FREE Bonus Areas for 3 issues only"
Line 183.

### Files to change
- `src/components/dashboard/ViewQuoteContent.tsx`

