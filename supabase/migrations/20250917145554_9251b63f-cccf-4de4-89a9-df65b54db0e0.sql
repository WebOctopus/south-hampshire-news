-- Add discount_type field to profiles table to support multiple status types
ALTER TABLE public.profiles 
ADD COLUMN discount_type text DEFAULT 'none' CHECK (discount_type IN ('none', 'agency', 'charity', 'discretionary'));

-- Update existing records: set discount_type based on current is_agency_member value
UPDATE public.profiles 
SET discount_type = CASE 
  WHEN is_agency_member = true THEN 'agency'
  ELSE 'none'
END;