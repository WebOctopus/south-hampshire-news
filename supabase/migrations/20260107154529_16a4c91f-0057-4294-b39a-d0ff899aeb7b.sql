-- Update subscription_pricing_per_issue to correct per-month values from spreadsheet
UPDATE ad_sizes SET subscription_pricing_per_issue = '{"1": 27, "2": 51, "3": 73, "4": 95, "5": 116, "6": 136, "7": 155}'::jsonb WHERE name = '1/8 Page' AND is_active = true;

UPDATE ad_sizes SET subscription_pricing_per_issue = '{"1": 37, "2": 69, "3": 99, "4": 128, "5": 156, "6": 183, "7": 209}'::jsonb WHERE name = '1/6 Page' AND is_active = true;

UPDATE ad_sizes SET subscription_pricing_per_issue = '{"1": 48, "2": 90, "3": 129, "4": 167, "5": 204, "6": 239, "7": 273}'::jsonb WHERE name = '1/4 Page' AND is_active = true;

UPDATE ad_sizes SET subscription_pricing_per_issue = '{"1": 64, "2": 125, "3": 185, "4": 244, "5": 301, "6": 356, "7": 408}'::jsonb WHERE name = '1/3 Page' AND is_active = true;

UPDATE ad_sizes SET subscription_pricing_per_issue = '{"1": 77, "2": 144, "3": 207, "4": 268, "5": 327, "6": 384, "7": 438}'::jsonb WHERE name = '1/2 Page Landscape' AND is_active = true;

UPDATE ad_sizes SET subscription_pricing_per_issue = '{"1": 96, "2": 182, "3": 266, "4": 347, "5": 426, "6": 502, "7": 574}'::jsonb WHERE name = '2/3 Page' AND is_active = true;

UPDATE ad_sizes SET subscription_pricing_per_issue = '{"1": 127, "2": 238, "3": 342, "4": 442, "5": 540, "6": 634, "7": 724}'::jsonb WHERE name = 'Full Page' AND is_active = true;