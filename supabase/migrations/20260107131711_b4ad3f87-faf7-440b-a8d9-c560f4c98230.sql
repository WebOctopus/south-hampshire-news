-- Remove the highlighted features from Fixed Term package
UPDATE public.product_packages 
SET features = '[{"highlight": false, "label": "Number of Inserts", "value": "1, 2 or 3"}, {"highlight": false, "label": "Ad Hoc Option", "value": true}]'::jsonb,
    updated_at = now()
WHERE package_id = 'fixed';