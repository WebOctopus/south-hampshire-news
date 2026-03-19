

## Remove "+ vat" from Latest Quote Card

### Change
**File: `src/components/dashboard/QuoteConversionCard.tsx`** (line 150)

Remove the ` + vat` text from the price display, changing:
```tsx
)} + vat
```
to:
```tsx
)}
```

This only affects the QuoteConversionCard (the "Latest Quote" card on the dashboard). Other pricing displays elsewhere are unchanged.

