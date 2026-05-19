
DELETE FROM quote_requests WHERE ad_size_id = 'e4eba992-2d7f-466e-9b62-62c42c079b6d';
DELETE FROM booking_artwork WHERE booking_id IN ('0b5e43cc-b606-4b05-bbf7-1c45d7bf53ac','281c8dd6-b72f-4eae-b1db-b89fe05a7560','29df23a8-6ea2-47a1-af6c-cf0b63c6e6c0');
DELETE FROM gocardless_payments WHERE booking_id IN ('0b5e43cc-b606-4b05-bbf7-1c45d7bf53ac','281c8dd6-b72f-4eae-b1db-b89fe05a7560','29df23a8-6ea2-47a1-af6c-cf0b63c6e6c0');
DELETE FROM gocardless_subscriptions WHERE booking_id IN ('0b5e43cc-b606-4b05-bbf7-1c45d7bf53ac','281c8dd6-b72f-4eae-b1db-b89fe05a7560','29df23a8-6ea2-47a1-af6c-cf0b63c6e6c0');
DELETE FROM gocardless_mandates WHERE booking_id IN ('0b5e43cc-b606-4b05-bbf7-1c45d7bf53ac','281c8dd6-b72f-4eae-b1db-b89fe05a7560','29df23a8-6ea2-47a1-af6c-cf0b63c6e6c0');
DELETE FROM invoices WHERE booking_id IN ('0b5e43cc-b606-4b05-bbf7-1c45d7bf53ac','281c8dd6-b72f-4eae-b1db-b89fe05a7560','29df23a8-6ea2-47a1-af6c-cf0b63c6e6c0');
DELETE FROM bookings WHERE id IN ('0b5e43cc-b606-4b05-bbf7-1c45d7bf53ac','281c8dd6-b72f-4eae-b1db-b89fe05a7560','29df23a8-6ea2-47a1-af6c-cf0b63c6e6c0');
DELETE FROM ad_sizes WHERE id = 'e4eba992-2d7f-466e-9b62-62c42c079b6d';
