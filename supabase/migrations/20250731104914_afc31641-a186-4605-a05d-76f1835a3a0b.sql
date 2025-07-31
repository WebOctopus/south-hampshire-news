-- Add sample pricing areas data
INSERT INTO pricing_areas (name, postcodes, circulation, base_price_multiplier, quarter_page_multiplier, half_page_multiplier, full_page_multiplier, sort_order) VALUES
('SOUTHAMPTON CITY', ARRAY['SO15', 'SO16', 'SO17'], 10000, 1.0, 1.0, 1.0, 1.0, 1),
('CHANDLERS FORD', ARRAY['SO53', 'SO52'], 11300, 1.0, 1.0, 1.0, 1.0, 2),
('EASTLEIGH & VILLAGES', ARRAY['SO50'], 12500, 0.85, 0.85, 0.85, 0.85, 3),
('HEDGE END & BOTLEY', ARRAY['SO30'], 9400, 0.95, 0.95, 0.95, 0.95, 4),
('LOCKS HEATH & VILLAGES', ARRAY['SO31'], 12000, 0.95, 0.95, 0.95, 0.95, 5),
('FAREHAM & VILLAGES', ARRAY['PO13', 'PO14', 'PO15'], 12100, 1.05, 1.05, 1.05, 1.05, 6),
('MEON VALLEY', ARRAY['SO32', 'PO17'], 12400, 1.05, 1.05, 1.05, 1.05, 7),
('WINCHESTER & VILLAGES', ARRAY['SO21', 'SO22', 'SO23'], 12000, 1.0, 1.0, 1.0, 1.0, 8),
('ROMSEY & TEST VALLEY', ARRAY['SO51', 'SO20'], 8600, 1.15, 1.15, 1.15, 1.15, 9),
('TOTTON', ARRAY['SO40', 'SO45'], 7000, 1.05, 1.05, 1.05, 1.05, 10),
('NEW FOREST & WATERSIDE', ARRAY['SO41', 'SO42', 'SO43', 'BH24'], 10640, 1.0, 1.0, 1.0, 1.0, 11),
('HAVANT & SURROUNDS', ARRAY['PO9', 'PO10', 'PO11', 'PO12'], 7000, 1.15, 1.15, 1.15, 1.15, 12);

-- Add sample ad sizes data
INSERT INTO ad_sizes (name, dimensions, base_price_per_month, base_price_per_area, sort_order) VALUES
('Full Page', '132 x 190mm', 298, 298, 1),
('2/3 Page', '132 x 125.33mm', 226, 226, 2),
('1/2 Page', '132 x 93mm', 180, 180, 3),
('1/3 Page', '132 x 60.66mm', 174, 174, 4),
('1/4 Page', '64 x 93mm', 112, 112, 5),
('1/6 Page', '64 x 60.66mm', 73, 73, 6),
('1/8 Page', '64 x 45.5mm', 54, 54, 7);

-- Add sample duration options
INSERT INTO pricing_durations (name, duration_type, duration_value, discount_percentage, sort_order) VALUES
('1 Issue', 'issues', 1, 0, 1),
('2 Issues', 'issues', 2, 0, 2),
('3 Issues', 'issues', 3, 0, 3),
('6 Months Subscription', 'months', 6, 0, 4),
('12 Months Subscription', 'months', 12, 10, 5);

-- Add sample volume discounts
INSERT INTO volume_discounts (min_areas, max_areas, discount_percentage) VALUES
(1, 2, 0),
(3, 5, 5),
(6, 9, 10),
(10, NULL, 15);

-- Add sample special deals
INSERT INTO special_deals (name, deal_type, description, deal_value, min_areas, valid_from, valid_until) VALUES
('All Areas Package', 'percentage', 'Save over £500 with our exclusive package deal for all 12 areas', 500, 12, NOW(), NOW() + INTERVAL '6 months'),
('BOGOF Special', 'bogof', 'Buy One Get One Free for first 6 months on subscription packages', 50, 3, NOW(), NOW() + INTERVAL '3 months');