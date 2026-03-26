

## Fix: Show Full Month Names with Year in Booking Summary Issues

**Problem**: Issues display as "June, August" (no year) instead of "June 2026, August 2026" to match the admin backend format.

**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

### Change

Line 471: Change `month: 'short'` to `month: 'long'` in the `formatMonth` function so months display as "June 2026" instead of "Jun 2026".

This single change ensures all area cards in the booking summary show the full month name with year (e.g., "June 2026, August 2026").

