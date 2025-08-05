-- Add available_for field to control which pricing types each ad size supports
ALTER TABLE public.ad_sizes 
ADD COLUMN available_for jsonb DEFAULT '["fixed", "subscription"]'::jsonb;

-- Update existing records to match current logic
-- 1/6 Page and 1/8 Page should only be available for subscription
UPDATE public.ad_sizes 
SET available_for = '["subscription"]'::jsonb 
WHERE name IN ('1/6 Page', '1/8 Page');

-- All other sizes should be available for both
UPDATE public.ad_sizes 
SET available_for = '["fixed", "subscription"]'::jsonb 
WHERE name NOT IN ('1/6 Page', '1/8 Page');