-- Add fraud prevention columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS ip_address_hash text,
ADD COLUMN IF NOT EXISTS device_fingerprint text;

-- Create indexes for fast fraud detection lookups
CREATE INDEX IF NOT EXISTS idx_bookings_email_pricing ON bookings(email, pricing_model) WHERE payment_status = 'paid';
CREATE INDEX IF NOT EXISTS idx_bookings_phone_pricing ON bookings(phone, pricing_model) WHERE payment_status = 'paid' AND phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_ip_hash ON bookings(ip_address_hash) WHERE ip_address_hash IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.ip_address_hash IS 'Hashed IP address for fraud detection (one-time BOGOF offer tracking)';
COMMENT ON COLUMN bookings.device_fingerprint IS 'Browser fingerprint for fraud detection (one-time BOGOF offer tracking)';