-- Add issue-based pricing structure to ad_sizes table
ALTER TABLE public.ad_sizes 
ADD COLUMN fixed_pricing_per_issue JSONB DEFAULT '{}',
ADD COLUMN subscription_pricing_per_issue JSONB DEFAULT '{}';

-- Update ad_sizes table with example pricing structure for Full Page ad
-- This will store pricing for 1-14 issues for both fixed and subscription models
UPDATE public.ad_sizes 
SET 
  fixed_pricing_per_issue = '{
    "1": 298, "2": 582, "3": 858, "4": 1128, "5": 1390, "6": 1646, "7": 1896, "8": 2140, 
    "9": 2384, "10": 2620, "11": 2854, "12": 3088, "13": 3322, "14": 3550
  }',
  subscription_pricing_per_issue = '{
    "1": 254, "2": 476, "3": 684, "4": 884, "5": 1080, "6": 1268, "7": 1448, "8": 1620, 
    "9": 1788, "10": 1952, "11": 2112, "12": 2272, "13": 2432, "14": 2592
  }'
WHERE name = 'Full Page';

-- Update other ad sizes with their respective pricing
UPDATE public.ad_sizes 
SET 
  fixed_pricing_per_issue = '{
    "1": 226, "2": 429, "3": 628, "4": 820, "5": 997, "6": 1166, "7": 1324, "8": 1483, 
    "9": 1641, "10": 1799, "11": 1957, "12": 2115, "13": 2274, "14": 2432
  }',
  subscription_pricing_per_issue = '{
    "1": 204, "2": 357, "3": 504, "4": 647, "5": 785, "6": 908, "7": 1010, "8": 1112, 
    "9": 1214, "10": 1316, "11": 1418, "12": 1520, "13": 1622, "14": 1724
  }'
WHERE name LIKE '%2/3%' OR name LIKE '%Two Third%';

-- Update Half Page
UPDATE public.ad_sizes 
SET 
  fixed_pricing_per_issue = '{
    "1": 180, "2": 342, "3": 500, "4": 653, "5": 794, "6": 929, "7": 1055, "8": 1181, 
    "9": 1307, "10": 1433, "11": 1559, "12": 1685, "13": 1811, "14": 1937
  }',
  subscription_pricing_per_issue = '{
    "1": 153, "2": 268, "3": 378, "4": 485, "5": 589, "6": 681, "7": 757, "8": 834, 
    "9": 910, "10": 987, "11": 1063, "12": 1140, "13": 1216, "14": 1293
  }'
WHERE name = 'Half Page';

-- Update Quarter Page
UPDATE public.ad_sizes 
SET 
  fixed_pricing_per_issue = '{
    "1": 112, "2": 213, "3": 311, "4": 407, "5": 494, "6": 578, "7": 656, "8": 735, 
    "9": 813, "10": 892, "11": 970, "12": 1048, "13": 1127, "14": 1205
  }',
  subscription_pricing_per_issue = '{
    "1": 95, "2": 167, "3": 235, "4": 302, "5": 367, "6": 424, "7": 471, "8": 519, 
    "9": 566, "10": 614, "11": 662, "12": 709, "13": 757, "14": 804
  }'
WHERE name = 'Quarter Page';