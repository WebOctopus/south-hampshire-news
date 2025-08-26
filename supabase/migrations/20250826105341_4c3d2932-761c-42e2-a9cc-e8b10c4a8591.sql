-- Update pricing_areas with correct 2025-2026 Print Schedule data
-- Mapping Print Schedule magazine names to database location names

-- Southampton (Area 1)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 1 - SOUTHAMPTON CITY';

-- Chandlers Ford (Area 2)  
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 2 - CHANDLER''S FORD';

-- Eastleigh (Area 3)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 3 - EASTLEIGH & VILLAGES';

-- Hedge End (Area 4)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 4 - HEDGE END & BOTLEY';

-- Locks Heath (Area 5)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 5 - LOCKS HEATH & VILLAGES';

-- Fareham (Area 6)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 6 - FAREHAM & VILLAGES';

-- Meon Valley (Area 7)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 7 - MEON VALLEY';

-- Winchester (Area 8)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 8 - WINCHESTER & VILLAGES';

-- Romsey (Area 9)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 9 - ROMSEY & N BADDESLEY';

-- Totton (Area 10)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 10 - TOTTON';

-- New Forest (Area 11)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 11 - NEW FOREST & WATERSIDE';

-- Sholing (Area 12)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 12 - SHOLING, PEARTREE, ITCHEN, WOOLSTON';

-- Hamble (Area 13)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 13 - HAMBLE, NETLEY, BURSLEDON';

-- Stockbridge (Area 14)
UPDATE pricing_areas 
SET schedule = '[
  {"month": "2025-09", "year": 2025, "copy_deadline": "2025-08-18", "print_deadline": "2025-08-20", "delivery_date": "2025-09-01"},
  {"month": "2025-10", "year": 2025, "copy_deadline": "2025-09-19", "print_deadline": "2025-09-23", "delivery_date": "2025-10-07"},
  {"month": "2025-11", "year": 2025, "copy_deadline": "2025-10-20", "print_deadline": "2025-10-22", "delivery_date": "2025-11-03"},
  {"month": "2025-12", "year": 2025, "copy_deadline": "2025-11-17", "print_deadline": "2025-11-19", "delivery_date": "2025-12-01"},
  {"month": "2026-01", "year": 2026, "copy_deadline": "2025-12-15", "print_deadline": "2025-12-17", "delivery_date": "2026-01-05"},
  {"month": "2026-02", "year": 2026, "copy_deadline": "2026-01-19", "print_deadline": "2026-01-21", "delivery_date": "2026-02-02"},
  {"month": "2026-03", "year": 2026, "copy_deadline": "2026-02-16", "print_deadline": "2026-02-18", "delivery_date": "2026-03-02"}
]'::jsonb
WHERE name = 'Area 14 - STOCKBRIDGE, WELLOWS & TEST VALLEY VILLAGES';