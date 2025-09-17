-- Add agency fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_agency_member boolean DEFAULT false,
ADD COLUMN agency_discount_percent numeric DEFAULT 0 CHECK (agency_discount_percent >= 0 AND agency_discount_percent <= 100),
ADD COLUMN agency_name text;

-- Create an index for better performance on agency queries
CREATE INDEX idx_profiles_agency_member ON public.profiles(is_agency_member) WHERE is_agency_member = true;