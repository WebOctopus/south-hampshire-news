

## Remove "Awaiting Contact" Badge from Saved Quotes

The "Awaiting Contact" status (`bogof_return_interest`) is set when a returning BOGOF customer submits a new quote. It was meant to signal the sales team. On the customer dashboard it's confusing.

### Changes

**`src/pages/Dashboard.tsx`**:
- Remove the `bogof_return_interest` special case in `getStatusBadge()` (~line 1181-1183) so it falls through to showing nothing or "Saved Quote"
- Remove the amber Alert banner that appears when the first quote has this status (~lines 1205-1213)

**`src/components/dashboard/QuoteConversionCard.tsx`**:
- Remove the `bogof_return_interest` case from `getStatusColor()` and `getStatusLabel()` — let it default to "Saved Quote"
- Remove the `isReturningBogofCustomer` variable if no longer used

**`src/components/dashboard/ViewQuoteContent.tsx`**:
- Remove the `bogof_return_interest` case from `getStatusLabel()` — defaults to "Saved Quote"

The underlying `status` value stays in the database (still useful for admin/sales), but customers will just see "Saved Quote".

