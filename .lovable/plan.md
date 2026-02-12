

## Plan: Update Payment Option Text to "GoCardless"

### Overview
Replace "Direct Debit" with "GoCardless" in the payment option descriptions across all summary/basket views where the 3 Payment Options are displayed.

### Changes

| File | Line | Current Text | New Text |
|------|------|-------------|----------|
| `src/components/BookingSummaryStep.tsx` | 663 | `'Direct Debit'` | `'GoCardless'` |
| `src/components/EditQuoteForm.tsx` | 601 | `'Direct Debit'` | `'GoCardless'` |

These are the two files where the Monthly Payment Plan sub-label reads "Direct Debit" under the payment option radio buttons. Both will be updated to say "GoCardless" instead.

No other files are affected for this specific summary page text.

