

## Fix "Book Now" Flow — Require Terms Acceptance Before Booking Creation

### Problem
When a user clicks "Book Now" directly from the CreateBookingForm (instead of "Save as Quote"), the booking is created immediately without terms acceptance. The BookingCard then shows "Booking Terms Accepted" (because it maps `payment_status: 'pending'` to that label), which is misleading. When the user then clicks through to BookingDetailsDialog, the terms checkbox is unticked — exposing the inconsistency.

### Root Cause
Two issues:
1. **CreateBookingForm** `handleBookNow` inserts directly into `bookings` table without showing the TermsAcceptanceDialog first, and without setting `terms_accepted_at`.
2. **BookingCard** `getPaymentStatusLabel` returns "Booking Terms Accepted" for any `pending` payment status, regardless of whether `terms_accepted_at` is actually set.

### Fix

#### 1. CreateBookingForm (`src/components/dashboard/CreateBookingForm.tsx`)
- Change the "Book Now" button flow: instead of creating a booking directly, first save as a quote (silently), then trigger the terms acceptance flow.
- Add new props: `onBookNowWithTerms?: (quote: any) => void` — this callback passes the newly created quote to the parent Dashboard, which opens the TermsAcceptanceDialog.
- The `handleBookNow` function becomes: save as quote → call `onBookNowWithTerms(quote)`.

#### 2. Dashboard (`src/pages/Dashboard.tsx`)
- Pass `onBookNowWithTerms` callback to CreateBookingForm that receives the quote and opens the TermsAcceptanceDialog (reusing the existing `handleBookNow` which sets `termsQuote` and opens the dialog).
- After terms are confirmed, the existing `handleTermsConfirm` converts quote to booking with `terms_accepted_at` set — this flow already works correctly.

#### 3. BookingCard (`src/components/dashboard/BookingCard.tsx`)
- Fix `getPaymentStatusLabel`: when `payment_status` is `pending`, check if the booking has `terms_accepted_at` set. If not, show "Terms Not Accepted" or "Awaiting Terms" instead of "Booking Terms Accepted".
- Add `terms_accepted_at` to the booking interface type.

### What stays the same
- The quote-based "Accept Terms & Book" flow from QuoteConversionCard — already works correctly.
- TermsAcceptanceDialog component — unchanged.
- BookingDetailsDialog terms display logic — unchanged.

