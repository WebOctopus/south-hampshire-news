-- Fix spelling mistake in Woolston edition area
UPDATE businesses 
SET edition_area = 'Area 12 - SO19 Woolston & surrounds'
WHERE edition_area = 'Area 12 - SO19 Woolston &B surrounds';