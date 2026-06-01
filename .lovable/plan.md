## Problem

New clients can't upload artwork because `ArtworkUploadTab` only lists bookings with `payment_status` in `('paid', 'confirmed', 'payment_pending')`. In the database the vast majority of bookings sit in `pending`, `checkout_initiated`, `mandate_active`, or `mandate_created`, so the tab renders the "No Artwork Required" empty state and the per-booking upload UI never appears.

The sidebar entry itself is already wired correctly for `active`/`none` advertisers (`src/pages/Dashboard.tsx` + `DashboardSidebar`), so no sidebar change is needed for this case.

## Fix

In `src/components/dashboard/ArtworkUploadTab.tsx`:

1. **Broaden the booking query** so a freshly created booking is visible. Include any booking that isn't cancelled/failed:
   - Replace the `.in('payment_status', [...])` filter with `.not('payment_status', 'in', '("cancelled","failed","refunded")')` (and keep the `user_id` + ordering).
   - This surfaces `pending`, `checkout_initiated`, `payment_pending`, `paid`, `mandate_created`, `mandate_active`, etc.

2. **Per-booking status badge stays** (already renders `booking.payment_status`) so clients can see whether payment is still outstanding while they upload.

3. **Empty-state copy** stays for users with literally zero bookings, but reword to: "Once you've made a booking, you'll be able to upload your print-ready artwork here."

4. **Upload entry point** remains inside the existing `ArtworkUploadSection` (per booking), as confirmed — no extra button on the Bookings tab.

No changes to the sidebar, routing, or database. No business-logic changes to artwork acceptance rules (still 300dpi PDF/JPG via existing `ArtworkUploadSection`).

## Files touched

- `src/components/dashboard/ArtworkUploadTab.tsx` — query filter + empty-state copy only.
