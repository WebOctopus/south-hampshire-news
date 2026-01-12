-- Fix subscription pricing to show correct per-month values (not per-issue)
-- These values match the spreadsheet and are half of the incorrectly doubled values

UPDATE public.ad_sizes SET subscription_pricing_per_issue = 
  '{"1": 27, "2": 51, "3": 73, "4": 95, "5": 116, "6": 136, "7": 155, "8": 173, "9": 191, "10": 208, "11": 225, "12": 241, "13": 257, "14": 273}'::jsonb
WHERE name = '1/8 Page';

UPDATE public.ad_sizes SET subscription_pricing_per_issue = 
  '{"1": 37, "2": 69, "3": 99, "4": 128, "5": 156, "6": 183, "7": 209, "8": 234, "9": 259, "10": 283, "11": 306, "12": 329, "13": 351, "14": 373}'::jsonb
WHERE name = '1/6 Page';

UPDATE public.ad_sizes SET subscription_pricing_per_issue = 
  '{"1": 48, "2": 90, "3": 129, "4": 167, "5": 204, "6": 239, "7": 273, "8": 306, "9": 338, "10": 369, "11": 399, "12": 429, "13": 458, "14": 487}'::jsonb
WHERE name = '1/4 Page';

UPDATE public.ad_sizes SET subscription_pricing_per_issue = 
  '{"1": 62, "2": 117, "3": 168, "4": 217, "5": 265, "6": 311, "7": 355, "8": 398, "9": 439, "10": 479, "11": 519, "12": 557, "13": 595, "14": 632}'::jsonb
WHERE name = '1/3 Page';

UPDATE public.ad_sizes SET subscription_pricing_per_issue = 
  '{"1": 86, "2": 162, "3": 232, "4": 300, "5": 366, "6": 430, "7": 491, "8": 551, "9": 608, "10": 664, "11": 718, "12": 771, "13": 823, "14": 874}'::jsonb
WHERE name = '1/2 Page';

UPDATE public.ad_sizes SET subscription_pricing_per_issue = 
  '{"1": 117, "2": 219, "3": 314, "4": 406, "5": 496, "6": 582, "7": 665, "8": 745, "9": 823, "10": 898, "11": 972, "12": 1043, "13": 1114, "14": 1182}'::jsonb
WHERE name = '2/3 Page';

UPDATE public.ad_sizes SET subscription_pricing_per_issue = 
  '{"1": 154, "2": 289, "3": 414, "4": 536, "5": 654, "6": 768, "7": 877, "8": 983, "9": 1086, "10": 1185, "11": 1282, "12": 1376, "13": 1469, "14": 1559}'::jsonb
WHERE name = 'Full Page';