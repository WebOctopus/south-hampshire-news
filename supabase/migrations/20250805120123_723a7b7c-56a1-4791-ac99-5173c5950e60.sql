-- Fix the 1/8 Page ad size pricing data format
-- Convert the object format to proper array format for subscription pricing
UPDATE ad_sizes 
SET subscription_pricing_per_issue = '[36, 63, 89, 172, 138, 159, 177, 195, 212, 230, 246, 263, 279, 295]'::jsonb
WHERE name = '1/8 Page';

-- Also ensure it's available for both fixed and subscription pricing
UPDATE ad_sizes 
SET available_for = '["fixed", "subscription"]'::jsonb
WHERE name = '1/8 Page';