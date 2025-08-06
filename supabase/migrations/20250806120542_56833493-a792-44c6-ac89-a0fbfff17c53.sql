-- Create comprehensive duration options for both fixed and subscription models

-- Insert fixed durations (no discount tiers for fixed)
INSERT INTO pricing_durations (name, duration_type, duration_value, discount_percentage, sort_order, is_active) 
VALUES 
  ('1 Issue', 'fixed', 1, 0, 1, true),
  ('2 Issues', 'fixed', 2, 0, 2, true),
  ('3 Issues', 'fixed', 3, 0, 3, true);

-- Insert additional subscription durations with progressive discounts
INSERT INTO pricing_durations (name, duration_type, duration_value, discount_percentage, sort_order, is_active) 
VALUES 
  ('3 Months', 'subscription', 3, 0, 1, true),
  ('18 Months (25% Discount)', 'subscription', 18, 25, 5, true),
  ('24 Months (30% Discount)', 'subscription', 24, 30, 6, true);

-- Update existing 6 months duration to have proper sort order
UPDATE pricing_durations 
SET sort_order = 3 
WHERE duration_type = 'subscription' AND duration_value = 6;