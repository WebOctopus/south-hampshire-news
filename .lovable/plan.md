## Delete the "DUMMY £" Ad Size

The FK error is because 3 bookings still reference this ad size:

| Contact | Email | Status | Total | Created |
|---|---|---|---|---|
| Melanie Tinson | melanietinson17@gmail.com | pending | £4.80 | 17 Mar 2026 |
| Princess Skye | pa.svs@langdonscott.co.uk | pending | £1.00 | 18 Mar 2026 |
| Prince Skye | pa.svs@langdonscott.co.uk | pending | £2.00 | 18 Mar 2026 |

All three look like test bookings (pending status, tiny totals tied to the dummy product).

### Proposed steps (single migration)

1. Delete the 3 bookings above by id (no related artwork/invoices/payments to clean up since they're pending test rows — I'll add safety deletes for booking_artwork / invoices / gocardless_* tied to those booking ids just in case).
2. Delete the ad size row `e4eba992-2d7f-466e-9b62-62c42c079b6d` ("DUMMY £").

### Please confirm

Are you happy for me to delete those 3 test bookings as part of removing the dummy ad size? If any of them are real, tell me which to keep and I'll reassign them to a real ad size instead.
