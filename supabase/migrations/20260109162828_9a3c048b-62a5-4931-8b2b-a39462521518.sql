UPDATE product_packages 
SET features = '[{"label": "Door-to-door delivery", "value": true, "highlight": false}, {"label": "GPS tracking", "value": true, "highlight": true}, {"label": "REGULAR DELIVERY TEAM - no agencies", "value": true, "highlight": false}, {"label": "Design & Print Service", "value": true, "highlight": false}]'::jsonb,
    updated_at = now()
WHERE package_id = 'leafleting';