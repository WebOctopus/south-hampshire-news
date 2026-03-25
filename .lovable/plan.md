

## Remove Dialog Heading and Blue Review Notice from Booking Details

**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

### Changes

1. **Remove the DialogHeader block** (lines 327-331) containing the booking title ("3+ Repeat Package Quote"). The Campaign Overview section already shows all relevant details.

2. **Remove the blue verification message block** (lines 334-348) — the "Please Review Your Campaign Details" notice with the blue background. This is irrelevant for confirmed bookings.

### Result
The dialog will open directly showing the Campaign Overview card without redundant heading or pre-payment review messaging.

