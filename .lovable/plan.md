

## Three Fixes for Post-Payment Booking Experience

### 1. Redirect to "Your Bookings" tab after GoCardless payment
**File: `src/pages/PaymentSetup.tsx`** (line 182)

Change `navigate('/dashboard')` to `navigate('/dashboard?tab=bookings')` so users land on the bookings screen instead of Create New Booking.

### 2. Show "Payment Setup Complete" for in-progress payment statuses
**File: `src/components/dashboard/BookingCard.tsx`** (lines 143-148)

Update `getPaymentStatusLabel` to return "Payment Setup Complete" for `payment_pending`, `subscription_pending`, and `mandate_created` statuses. These indicate GoCardless is processing but payment setup was successful from the user's perspective.

Also update the `isPaymentRequired` logic (line 47) to exclude these statuses, and add them to the `isPaid`-like display so they get the green styling instead of amber.

### 3. Add a "View Booking Details" button on the card
**File: `src/components/dashboard/BookingCard.tsx`**

For bookings that have completed payment setup (status is `payment_pending`, `subscription_pending`, `mandate_created`, or paid), add a visible coloured button at the bottom of the card labelled "View Booking Details" that triggers `onViewDetails`. This replaces the invisible click-anywhere-on-card pattern with an explicit call to action.

