-- Add date fields for leaflet bookings
ALTER TABLE public.bookings 
ADD COLUMN leaflets_required_by DATE,
ADD COLUMN distribution_start_date DATE;

-- Add same fields to quote_requests for leaflet quotes
ALTER TABLE public.quote_requests 
ADD COLUMN leaflets_required_by DATE,
ADD COLUMN distribution_start_date DATE;

-- Add same fields to quotes table for consistency
ALTER TABLE public.quotes 
ADD COLUMN leaflets_required_by DATE,
ADD COLUMN distribution_start_date DATE;