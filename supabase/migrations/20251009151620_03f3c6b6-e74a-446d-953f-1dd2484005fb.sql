-- Update 1/4 Page ad size dimensions to correct value
UPDATE ad_sizes 
SET dimensions = '64mm x 93mm' 
WHERE name = '1/4 Page' AND is_active = true;