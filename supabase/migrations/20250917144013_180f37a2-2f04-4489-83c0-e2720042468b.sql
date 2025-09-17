-- Add agency discount columns to quotes table
ALTER TABLE public.quotes 
ADD COLUMN agency_discount_percent numeric DEFAULT 0 CHECK (agency_discount_percent >= 0 AND agency_discount_percent <= 100);

-- Add agency discount columns to quote_requests table
ALTER TABLE public.quote_requests 
ADD COLUMN agency_discount_percent numeric DEFAULT 0 CHECK (agency_discount_percent >= 0 AND agency_discount_percent <= 100);