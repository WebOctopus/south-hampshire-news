-- Restore pricing durations that were accidentally deleted
INSERT INTO pricing_durations (name, duration_type, duration_value, discount_percentage, is_active, sort_order) VALUES
('1 Issue', 'fixed', 1, 0.00, true, 1),
('2 Issues', 'fixed', 2, 10.00, true, 2),
('3 Issues', 'fixed', 3, 15.00, true, 3),
('6 Months', 'subscription', 6, 20.00, true, 4),
('12 Months', 'subscription', 12, 25.00, true, 5);