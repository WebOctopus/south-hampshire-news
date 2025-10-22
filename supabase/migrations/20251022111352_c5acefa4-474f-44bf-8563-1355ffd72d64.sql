-- Add design_fee column to ad_sizes table
ALTER TABLE public.ad_sizes 
ADD COLUMN design_fee numeric DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.ad_sizes.design_fee IS 'Artwork design fee charged if customer requires design services';

-- Add design_fee column to leaflet_sizes table  
ALTER TABLE public.leaflet_sizes
ADD COLUMN design_fee numeric DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.leaflet_sizes.design_fee IS 'Artwork design fee charged if customer requires design services for leafleting';