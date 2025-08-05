-- Add missing ad sizes with their pricing structure

-- Insert 2/3 page ad size
INSERT INTO ad_sizes (
  name, 
  dimensions, 
  base_price_per_area, 
  base_price_per_month, 
  fixed_pricing_per_issue, 
  subscription_pricing_per_issue, 
  sort_order, 
  is_active
) VALUES (
  '2/3 Page',
  '186mm x 176mm',
  200.00,
  200.00,
  '{"1": 199, "2": 378, "3": 553, "4": 723, "5": 887, "6": 1045, "7": 1198, "8": 1345, "9": 1487, "10": 1624, "11": 1756, "12": 1883, "13": 2005, "14": 2122}'::jsonb,
  '{"1": 169, "2": 316, "3": 455, "4": 588, "5": 715, "6": 836, "7": 952, "8": 1063, "9": 1169, "10": 1270, "11": 1366, "12": 1458, "13": 1545, "14": 1628}'::jsonb,
  4,
  true
);

-- Insert 1/3 page ad size  
INSERT INTO ad_sizes (
  name, 
  dimensions, 
  base_price_per_area, 
  base_price_per_month, 
  fixed_pricing_per_issue, 
  subscription_pricing_per_issue, 
  sort_order, 
  is_active
) VALUES (
  '1/3 Page',
  '186mm x 88mm',
  100.00,
  100.00,
  '{"1": 93, "2": 177, "3": 259, "4": 339, "5": 412, "6": 483, "7": 549, "8": 612, "9": 672, "10": 729, "11": 792, "12": 854, "13": 909, "14": 963}'::jsonb,
  '{"1": 79, "2": 139, "3": 196, "4": 251, "5": 306, "6": 353, "7": 393, "8": 433, "9": 472, "10": 510, "11": 547, "12": 583, "13": 619, "14": 654}'::jsonb,
  5,
  true
);

-- Insert 1/6 page ad size (subscription only)
INSERT INTO ad_sizes (
  name, 
  dimensions, 
  base_price_per_area, 
  base_price_per_month, 
  fixed_pricing_per_issue, 
  subscription_pricing_per_issue, 
  sort_order, 
  is_active
) VALUES (
  '1/6 Page',
  '90mm x 88mm',
  60.00,
  60.00,
  '{}'::jsonb,
  '{"1": 48, "2": 84, "3": 118, "4": 151, "5": 184, "6": 212, "7": 236, "8": 260, "9": 283, "10": 306, "11": 328, "12": 350, "13": 372, "14": 393}'::jsonb,
  6,
  true
);

-- Insert 1/8 page ad size (subscription only)
INSERT INTO ad_sizes (
  name, 
  dimensions, 
  base_price_per_area, 
  base_price_per_month, 
  fixed_pricing_per_issue, 
  subscription_pricing_per_issue, 
  sort_order, 
  is_active
) VALUES (
  '1/8 Page',
  '90mm x 66mm',
  45.00,
  45.00,
  '{}'::jsonb,
  '{"1": 36, "2": 63, "3": 89, "4": 113, "5": 138, "6": 159, "7": 177, "8": 195, "9": 212, "10": 230, "11": 246, "12": 263, "13": 279, "14": 295}'::jsonb,
  7,
  true
);

-- Update existing ad sizes sort order to maintain proper ordering
UPDATE ad_sizes SET sort_order = 1 WHERE name = 'Quarter Page';
UPDATE ad_sizes SET sort_order = 2 WHERE name = '1/3 Page';  
UPDATE ad_sizes SET sort_order = 3 WHERE name = 'Half Page';
UPDATE ad_sizes SET sort_order = 4 WHERE name = '2/3 Page';
UPDATE ad_sizes SET sort_order = 5 WHERE name = 'Full Page';
UPDATE ad_sizes SET sort_order = 6 WHERE name = '1/6 Page';
UPDATE ad_sizes SET sort_order = 7 WHERE name = '1/8 Page';