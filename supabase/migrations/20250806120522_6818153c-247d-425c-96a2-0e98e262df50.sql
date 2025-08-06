-- Create comprehensive duration options for both fixed and subscription models

-- Insert fixed durations (no discount tiers for fixed)
INSERT INTO pricing_durations (name, duration_type, duration_value, discount_percentage, sort_order, is_active) 
VALUES 
  ('1 Issue', 'fixed', 1, 0, 1, true),
  ('2 Issues', 'fixed', 2, 0, 2, true),
  ('3 Issues', 'fixed', 3, 0, 3, true)
ON CONFLICT DO NOTHING;

-- Insert/update subscription durations with progressive discounts
INSERT INTO pricing_durations (name, duration_type, duration_value, discount_percentage, sort_order, is_active) 
VALUES 
  ('3 Months', 'subscription', 3, 0, 1, true),
  ('6 Months', 'subscription', 6, 0, 3, true),
  ('12 Months (20% Discount)', 'subscription', 12, 20, 4, true),
  ('18 Months (25% Discount)', 'subscription', 18, 25, 5, true),
  ('24 Months (30% Discount)', 'subscription', 24, 30, 6, true)
ON CONFLICT (duration_type, duration_value) 
DO UPDATE SET 
  name = EXCLUDED.name,
  discount_percentage = EXCLUDED.discount_percentage,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;