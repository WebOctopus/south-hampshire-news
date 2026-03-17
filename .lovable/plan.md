

## Redesign Quote-to-Booking Flow: Terms Acceptance Before Payment

### Problem
Currently "Book Now" on a quote immediately creates a booking and implies payment. The user wants a clear separation:
1. **Quote** -> View & Accept Terms -> becomes a **Booking** (no payment yet)
2. **Booking** -> Set Up Payment Plan -> GoCardless

This also enables tracking two abandonment states:
- Terms viewed but not accepted = "abandoned booking"
- Terms accepted but payment not set up = "abandoned payment plan"

### Database Changes

Add tracking columns to the `bookings` table:
```sql
ALTER TABLE bookings ADD COLUMN terms_viewed_at timestamptz;
ALTER TABLE bookings ADD COLUMN terms_accepted_at timestamptz;
```

Add a `terms_viewed_at` column to the `quotes` table to track when a user opens the terms but doesn't accept:
```sql
ALTER TABLE quotes ADD COLUMN terms_viewed_at timestamptz;
```

### UI Changes

**1. QuoteConversionCard** (`src/components/dashboard/QuoteConversionCard.tsx`)
- Rename "Book Now" button to "View & Accept Terms"
- Change icon from `CheckCircle` to `Shield` or `FileText`
- Keep the green gradient styling

**2. New Terms Acceptance Dialog** (new component `src/components/dashboard/TermsAcceptanceDialog.tsx`)
- A dialog that opens when "View & Accept Terms" is clicked
- Shows the full BookingTerms content (reuse the accordion component)
- At the bottom: a checkbox "I have read and accept the Terms of Booking & Payment"
- A "Confirm Booking" button (disabled until checkbox ticked)
- On open: record `terms_viewed_at` on the quote (so if they close without accepting, we know it's an abandoned booking attempt)
- On confirm: create the booking with `terms_accepted_at = now()`, delete the quote, switch to bookings tab

**3. Dashboard.tsx** (`src/pages/Dashboard.tsx`)
- Replace `handleBookNow` logic: instead of directly creating booking, open the TermsAcceptanceDialog
- Add state for the terms dialog (`termsQuote`, `termsDialogOpen`)
- Move booking creation into the dialog's onConfirm callback, adding `terms_accepted_at` and `terms_viewed_at`

**4. BookingCard** (`src/components/dashboard/BookingCard.tsx`)
- Change "Complete Payment Now" button text to "Set Up Payment Plan"
- Update the alert text from "Complete your booking payment..." to "Set up your payment plan to start your advertising campaign"

**5. BookingDetailsDialog** (`src/components/dashboard/BookingDetailsDialog.tsx`)
- Update the "Make Payment by GoCardless" button label to "Set Up Payment Plan by GoCardless"
- The T&Cs checkbox and legal docs section remain as-is (already there for payment stage)

### Flow Summary

```text
QUOTE CARD                    TERMS DIALOG                BOOKING CARD              BOOKING DIALOG
┌──────────────┐   click    ┌──────────────────┐  accept  ┌──────────────┐  click   ┌────────────────┐
│ View & Accept├──────────>│ Terms content     │────────>│ Set Up       ├────────>│ Payment options│
│ Terms        │           │ ☐ I accept terms  │         │ Payment Plan │         │ GoCardless btn │
└──────────────┘           │ [Confirm Booking] │         └──────────────┘         └────────────────┘
                           └──────────────────┘
    If closed without           ↑                    If no payment set up
    accepting = abandoned       │                    = abandoned payment plan
    booking (terms_viewed_at    │
    set on quote)               │
                                │
                       terms_accepted_at set on booking
```

### Files to Change
1. **DB migration** — Add `terms_viewed_at` to `quotes`, add `terms_viewed_at` + `terms_accepted_at` to `bookings`
2. **New file**: `src/components/dashboard/TermsAcceptanceDialog.tsx` — Dialog with BookingTerms + acceptance checkbox
3. **Edit**: `src/components/dashboard/QuoteConversionCard.tsx` — Rename button to "View & Accept Terms"
4. **Edit**: `src/pages/Dashboard.tsx` — Wire up terms dialog, update booking creation flow
5. **Edit**: `src/components/dashboard/BookingCard.tsx` — Change "Complete Payment Now" to "Set Up Payment Plan"
6. **Edit**: `src/components/dashboard/BookingDetailsDialog.tsx` — Update GoCardless button label

