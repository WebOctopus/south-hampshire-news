

## Remove Delete Button, Add Conditional Cancel Button on Booking Cards

### Problem
The red trash bin delete button on booking cards allows deletion of processed bookings, which causes foreign key constraint errors (as seen in the screenshot with `gocardless_mandates_booking_id_fkey`). Processed bookings cannot be deleted.

### Changes

**File: `src/components/dashboard/BookingCard.tsx`**

1. **Remove the trash/delete button entirely** (lines 213-230). Remove `onDelete`, `isDeleting` props and the `Trash2` icon import.

2. **Add a Cancel button** that only appears for paid/confirmed bookings. For now, since we don't yet have print deadline data to calculate the 3-issue completion date, show the Cancel button on all paid bookings. Clicking it opens an alert dialog explaining:

   > "To cancel your subscription, please email accounts@discovermagazines.co.uk or call 023 8026 6388. Cancellations can only be processed after the completion of your first 3 paid issues."

3. **Import `AlertDialog` components** and add local state for the cancellation popup.

**File: `src/pages/Dashboard.tsx`**

4. **Remove `onDelete` and `isDeleting` props** from `<BookingCard>` usage (around line 1411). Remove `handleDeleteBooking` reference if it's only used here (or leave it for other uses).

### Technical Detail

The Cancel button will:
- Use `lucide-react`'s `XCircle` icon instead of `Trash2`
- Only render when `isPaid` is true
- Open a simple `AlertDialog` with the cancellation instructions
- Be styled as a subtle ghost button (not destructive red)

