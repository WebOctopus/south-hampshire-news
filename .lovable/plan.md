

## Fix: Campaign Overview — Start Date Year & Campaign Cost VAT

### Changes in `src/components/dashboard/BookingDetailsDialog.tsx`

**1. Start Date — append year when only a month name is present (line 342)**

Currently `formatStartDate` returns plain month names as-is (e.g. "April"). Change the fallback to append the current year (or derive from booking creation date):

```typescript
// Line 342: instead of just returning monthString
// Append year from booking.created_at or current year
const year = new Date(booking.created_at).getFullYear();
return `${monthString} ${year}`;
```

**2. Campaign Cost — add "+ VAT" suffix (lines 381-383)**

After both `formatPrice(...)` return expressions, append `+ " + VAT"`:

```typescript
return formatPrice(...) + ' + VAT';
```

### Files Changed

| File | Change |
|---|---|
| `src/components/dashboard/BookingDetailsDialog.tsx` | Line ~342: append year to plain month names in `formatStartDate`; Lines ~381,383: append "+ VAT" to campaign cost display |

