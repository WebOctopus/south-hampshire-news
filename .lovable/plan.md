

## Replace Booking Card Title with Date & Ad Size

### Problem
Booking cards show the title inherited from the quote (e.g. "3+ Repeat Package Quote" or "Dashboard Quote"), which is no longer appropriate once it's a confirmed booking.

### Changes

**File: `src/components/dashboard/BookingCard.tsx` (line 198)**

Replace `{booking.title}` with a formatted booking date and ad size description:

```tsx
<CardTitle className="text-lg leading-tight">
  {`Booked ${formatDate(booking.created_at).split(',')[0]}`}
  {booking.selections?.ad_size_name && (
    <span className="text-muted-foreground font-normal text-sm ml-2">
      — {booking.selections.ad_size_name}
    </span>
  )}
</CardTitle>
```

This will display something like: **Booked 25 Mar 2026 — Half Page**

The ad size name should be available in `booking.selections` (stored during quote creation). Will fall back gracefully if not present.

**File: `src/components/dashboard/QuoteConversionCard.tsx` (line 89)**

Also update the quote card fallback title to remove "Quote" suffix:

```tsx
{quote.title || getPricingModelDisplay(quote.pricing_model)}
```

### Technical Details
- `booking.selections` is a JSON column that stores the user's choices including ad size info
- `formatDate` already exists in the component
- No database changes needed

