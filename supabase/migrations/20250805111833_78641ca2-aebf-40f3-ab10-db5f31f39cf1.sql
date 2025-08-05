-- Update ad size names to use fraction format and reorder them

-- Update Quarter Page to 1/4 Page
UPDATE ad_sizes SET name = '1/4 Page' WHERE name = 'Quarter Page';

-- Update Half Page to 1/2 Page  
UPDATE ad_sizes SET name = '1/2 Page' WHERE name = 'Half Page';

-- Update sort order to match requested ordering:
-- Full page, 2/3 page, 1/2 page, 1/3 page, 1/4 page, 1/6 page, 1/8 page

UPDATE ad_sizes SET sort_order = 1 WHERE name = 'Full Page';
UPDATE ad_sizes SET sort_order = 2 WHERE name = '2/3 Page';
UPDATE ad_sizes SET sort_order = 3 WHERE name = '1/2 Page';
UPDATE ad_sizes SET sort_order = 4 WHERE name = '1/3 Page';
UPDATE ad_sizes SET sort_order = 5 WHERE name = '1/4 Page';
UPDATE ad_sizes SET sort_order = 6 WHERE name = '1/6 Page';
UPDATE ad_sizes SET sort_order = 7 WHERE name = '1/8 Page';