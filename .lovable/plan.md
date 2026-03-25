

## Change "Final Total" to "6 Payments (minimum)" for BOGOF Quotes

### Problem
The BOGOF (3+ Repeat Package) quote view shows "Monthly Price" and "Final Total". The user wants "Final Total" replaced with "6 payments (minimum)" showing the value as 6 × monthly payment + VAT.

### Changes

**File: `src/components/dashboard/ViewQuoteContent.tsx`**

Update the BOGOF pricing section (lines 128-143) to replace the second column:
- Change label from "Monthly Payment" to "6 payments (minimum)"
- Change value to show `6 × (monthly_price × paidAreas)` + VAT
- Keep the Monthly Price (per area) in the first column
- Add a sub-label showing the breakdown (e.g. "6 × £90.00 per month")

The result for the screenshot example (£90/area, 2 paid areas):
- **Monthly Price**: £90.00 + VAT
- **6 payments (minimum)**: £1,080.00 + VAT
  *(6 × £180.00 per month)*

