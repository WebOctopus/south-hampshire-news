

## Remove GoCardless & Payment Schedule from Fixed Term Booking Terms

**File: `src/components/dashboard/BookingTerms.tsx`**

Change the condition on lines 169-190 from `{!isLeafleting && (...)}` to `{!isLeafleting && !isFixed && (...)}`.

This ensures the GoCardless Bank Reference and Payment Schedule entries only appear for subscription (3+ Repeat) bookings, not for fixed term or leafleting.

