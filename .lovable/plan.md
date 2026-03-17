

## Problem

The address validation we added to `BookingDetailsDialog.tsx` blocks payment with a dead-end "Address Required" toast. The address is only present in `booking.selections` when the booking was converted from a quote (which collects address in `ContactInformationStep`). Bookings created directly via `CreateBookingForm` never save address fields, so those customers hit this wall with no way to proceed.

GoCardless's redirect flow actually has its own address collection page — the `prefilled_customer` fields are optional prefills, not requirements. The address validation is an unnecessary gate.

## Solution

**Remove the blocking validation and make the address a prefill instead.** If address data exists in `booking.selections`, pass it to GoCardless as prefill. If not, pass empty strings and let GoCardless collect the address on their hosted page (which they already do).

### Changes

**1. `src/components/dashboard/BookingDetailsDialog.tsx`**
- Remove the address validation block (lines 180-192) that shows the "Address Required" error toast
- Keep the address field extraction but use it only as optional prefill data — empty strings are fine
- GoCardless will prompt the customer for address details on their hosted page if not prefilled

**2. `src/components/dashboard/CreateBookingForm.tsx`** (minor improvement)
- Add address fields to the `selections` object when creating bookings directly, pulling from the user's profile if available
- This ensures future bookings have prefill data, but is not a hard requirement

This removes the friction point while still prefilling address data when available, and lets GoCardless handle address collection as part of their standard mandate setup flow.

