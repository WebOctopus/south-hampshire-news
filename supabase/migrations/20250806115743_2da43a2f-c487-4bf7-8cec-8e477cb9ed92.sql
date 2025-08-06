-- Update fixed and subscription pricing to match the provided spreadsheet

-- Full Page
UPDATE ad_sizes 
SET 
  fixed_pricing_per_issue = '{"1": 298, "2": 562, "3": 868, "4": 1128, "5": 1390, "6": 1646, "7": 1896, "8": 2140, "9": 2384, "10": 2620, "11": 2854, "12": 3088, "13": 3322, "14": 3550}'::jsonb,
  subscription_pricing_per_issue = '{"1": 254, "2": 476, "3": 684, "4": 884, "5": 1080, "6": 1268, "7": 1448, "8": 1620, "9": 1788, "10": 1952, "11": 2112, "12": 2272, "13": 2432, "14": 2592}'::jsonb
WHERE name = 'Full Page';

-- 2/3 Page
UPDATE ad_sizes 
SET 
  fixed_pricing_per_issue = '{"1": 226, "2": 429, "3": 628, "4": 820, "5": 997, "6": 1166, "7": 1324, "8": 1483, "9": 1641, "10": 1799, "11": 1957, "12": 2115, "13": 2274, "14": 2432}'::jsonb,
  subscription_pricing_per_issue = '{"1": 204, "2": 357, "3": 504, "4": 647, "5": 785, "6": 908, "7": 1010, "8": 1112, "9": 1214, "10": 1316, "11": 1418, "12": 1520, "13": 1622, "14": 1724}'::jsonb
WHERE name = '2/3 Page';

-- 1/2 Page
UPDATE ad_sizes 
SET 
  fixed_pricing_per_issue = '{"1": 180, "2": 342, "3": 500, "4": 653, "5": 794, "6": 929, "7": 1055, "8": 1181, "9": 1307, "10": 1433, "11": 1559, "12": 1685, "13": 1811, "14": 1937}'::jsonb,
  subscription_pricing_per_issue = '{"1": 153, "2": 268, "3": 378, "4": 485, "5": 589, "6": 681, "7": 757, "8": 834, "9": 910, "10": 987, "11": 1063, "12": 1140, "13": 1216, "14": 1293}'::jsonb
WHERE name = '1/2 Page';

-- 1/3 Page
UPDATE ad_sizes 
SET 
  fixed_pricing_per_issue = '{"1": 174, "2": 331, "3": 484, "4": 632, "5": 767, "6": 898, "7": 1020, "8": 1141, "9": 1263, "10": 1385, "11": 1507, "12": 1629, "13": 1750, "14": 1872}'::jsonb,
  subscription_pricing_per_issue = '{"1": 148, "2": 259, "3": 365, "4": 469, "5": 569, "6": 658, "7": 732, "8": 806, "9": 880, "10": 954, "11": 1028, "12": 1102, "13": 1176, "14": 1250}'::jsonb
WHERE name = '1/3 Page';

-- 1/4 Page
UPDATE ad_sizes 
SET 
  fixed_pricing_per_issue = '{"1": 112, "2": 213, "3": 311, "4": 407, "5": 494, "6": 578, "7": 656, "8": 735, "9": 813, "10": 892, "11": 970, "12": 1048, "13": 1127, "14": 1205}'::jsonb,
  subscription_pricing_per_issue = '{"1": 95, "2": 167, "3": 235, "4": 302, "5": 367, "6": 424, "7": 471, "8": 519, "9": 566, "10": 614, "11": 662, "12": 709, "13": 757, "14": 804}'::jsonb
WHERE name = '1/4 Page';

-- 1/6 Page (subscription only)
UPDATE ad_sizes 
SET 
  fixed_pricing_per_issue = '{}'::jsonb,
  subscription_pricing_per_issue = '{"1": 73, "2": 128, "3": 181, "4": 232, "5": 281, "6": 325, "7": 362, "8": 398, "9": 435, "10": 471, "11": 508, "12": 545, "13": 581, "14": 618}'::jsonb
WHERE name = '1/6 Page';

-- 1/8 Page (subscription only)
UPDATE ad_sizes 
SET 
  fixed_pricing_per_issue = '{}'::jsonb,
  subscription_pricing_per_issue = '{"1": 54, "2": 95, "3": 134, "4": 172, "5": 209, "6": 242, "7": 269, "8": 296, "9": 324, "10": 351, "11": 378, "12": 405, "13": 432, "14": 460}'::jsonb
WHERE name = '1/8 Page';