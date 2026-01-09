-- Drop GHL sync trigger (correct name) and function with CASCADE
DROP TRIGGER IF EXISTS trigger_business_sync ON businesses;
DROP FUNCTION IF EXISTS notify_business_sync() CASCADE;

-- Remove GHL-specific columns from businesses table
ALTER TABLE businesses 
DROP COLUMN IF EXISTS ghl_contact_id,
DROP COLUMN IF EXISTS ghl_location_id,
DROP COLUMN IF EXISTS last_synced_at;

-- Add edition_area column for the 14 editions mapping
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS edition_area TEXT;

-- Add sector column if it doesn't exist (for CSV import)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS sector TEXT;