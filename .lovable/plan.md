

## Show Pricing-Model-Specific Terms in the Acceptance Dialog

### Problem
The "View & Accept Terms" dialog always shows 3+ Subscription terms, even for Fixed Term quotes.

### Solution
Make `BookingTerms` accept a `pricingModel` prop and conditionally render the appropriate terms section.

**File 1: `src/components/dashboard/BookingTerms.tsx`**
- Add a `pricingModel?: string` prop
- Add a `fixedTermTerms` array with these 6 terms:
  1. Payment is due in full before publication
  2. Fixed term bookings run for the agreed number of issues only
  3. No automatic renewal — a new booking is required to continue
  4. Cancellation is not available once artwork has been submitted for print
  5. Design fees (if applicable) are non-refundable
  6. Prices are exclusive of VAT
- Conditionally render either the "3+ Subscription Terms" accordion item (for `bogof`) or a "Fixed Term Booking Terms" accordion item (for `fixed`/`fixed_term`), with appropriate badge text ("Fixed Term" instead of "3+ Repeat Package")
- Update the footer note to match the active pricing model

**File 2: `src/components/dashboard/TermsAcceptanceDialog.tsx`**
- Pass `quote.pricing_model` to `<BookingTerms pricingModel={quote.pricing_model} />`

**File 3: `src/pages/Dashboard.tsx`**
- The standalone `<BookingTerms />` usage in the Terms sidebar section should remain as-is (shows all terms for general reference) or could also be made model-aware if desired — no change needed here.

### Files Changed
- `src/components/dashboard/BookingTerms.tsx`
- `src/components/dashboard/TermsAcceptanceDialog.tsx`

