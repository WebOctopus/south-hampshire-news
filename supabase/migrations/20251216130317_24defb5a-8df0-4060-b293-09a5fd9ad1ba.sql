UPDATE product_packages 
SET features = '[
  {"label": "Minimum Number of Inserts", "value": "3", "highlight": false},
  {"label": "Subscription Payment Plan", "value": true, "highlight": false},
  {"label": "Save up to 30% vs Fixed Term", "value": true, "highlight": true},
  {"label": "Buy 1 Area Get 1 Area Free", "value": true, "highlight": true},
  {"label": "10% discount on Leafleting Service", "value": true, "highlight": false},
  {"label": "Free editorial", "value": true, "highlight": false},
  {"label": "Discounted Design Service", "value": true, "highlight": false},
  {"label": "Free Position Upgrades", "value": true, "highlight": false}
]'::jsonb,
updated_at = now()
WHERE package_id = 'bogof';