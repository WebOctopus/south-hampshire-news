

## Fix Leafleting Booking: Area Display & Payment Method

### Issues

1. **Area not loading** — `BookingDetailsDialog` only queries `pricing_areas` for area names. Leafleting bookings store area IDs from `leaflet_areas`, so the lookup returns nothing.

2. **Wrong payment options** — Leafleting bookings fall into the GoCardless `else` branch (line 723), showing monthly/12-month Direct Debit options. Leafleting should use Stripe with specific rules:
   - **25% deposit by card (Stripe)** as default
   - **100% in full** if the leaflet distribution date is within 10 days

### Plan

**Step 1: Fix area name lookup** (`BookingDetailsDialog.tsx`)
- When `booking.pricing_model === 'leafleting'`, query `leaflet_areas` instead of `pricing_areas` for area name resolution.
- Add a second query or make the existing one conditional on the pricing model.

**Step 2: Add leafleting payment logic** (`BookingDetailsDialog.tsx`)
- Add a new payment branch for `booking.pricing_model === 'leafleting'` (alongside the existing `fixed` branch).
- Calculate whether distribution date is within 10 days using `booking.distribution_start_date` or `booking.leaflets_required_by`.
- If within 10 days: show "Pay Full Amount by Card" via Stripe.
- If more than 10 days: show "Pay 25% Deposit by Card" via Stripe, with the remaining 75% noted as due before distribution.
- Both options use the existing `handleStripeCheckout` function, passing the correct amount (full or 25%).

**Step 3: Update Stripe checkout amount** (`BookingDetailsDialog.tsx`)
- Modify `handleStripeCheckout` to accept an optional amount override so it can send 25% for deposit payments.
- Store whether this is a deposit or full payment in the booking metadata.

**Step 4: Update BookingCard labels** (`BookingCard.tsx`)
- For leafleting bookings, show appropriate payment CTA text ("Pay Deposit" vs "Pay in Full").

### Files to change
1. `src/components/dashboard/BookingDetailsDialog.tsx` — area query fix + leafleting Stripe payment UI
2. `src/components/dashboard/BookingCard.tsx` — leafleting-specific CTA label

