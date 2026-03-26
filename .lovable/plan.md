

## Add Download Button & Payment Reference to Admin Artwork Management

### Changes

**File: `src/components/admin/ArtworkManagement.tsx`**

1. **Add "Payment Ref" column** to the table between "Ad Size" and "File" columns. Use the booking ID (truncated UUID) as the reference, since bookings don't have a dedicated payment reference field. Format: first 8 chars of booking ID uppercased (e.g., `A3F2B1C8`).

2. **Update bookings query** to also select `id` (already selected) and `payment_status` so admins can see payment state alongside the reference.

3. **Add a prominent Download button** in the Actions column — a clear `Download` button with the `Download` icon that triggers a direct file download (using `window.open` on the file URL). Currently there's only a small eye icon; this adds an explicit download action visible for all statuses, not just pending.

4. **Show payment status badge** next to the payment reference so admins can quickly verify if the booking was paid.

### Technical detail
- Payment reference column shows: `REF-{first 8 chars of booking.id}` — this matches what users see on their dashboard and can be cross-referenced with Stripe/GoCardless records.
- Download button added for all artwork rows (not just pending), using `<a download>` attribute for direct download behavior.

