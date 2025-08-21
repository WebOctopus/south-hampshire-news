-- Insert leafleting distribution areas from the provided table
INSERT INTO leaflet_areas (area_number, name, postcodes, bimonthly_circulation, price_with_vat, schedule, is_active) VALUES
(1, 'Southampton City', 'SO15, SO16, SO17', 7100, 315.00, '[]'::jsonb, true),
(2, 'Chandler''s Ford', 'SO53', 11300, 508.00, '[]'::jsonb, true),
(3, 'Eastleigh & Villages', 'SO50', 12500, 562.00, '[]'::jsonb, true),
(4, 'Hedge End & Botley', 'SO30', 9400, 423.00, '[]'::jsonb, true),
(5, 'Locksheath, Whiteley, Warsash & Surrounds', 'SO31, PO15', 12000, 540.00, '[]'::jsonb, true),
(6, 'Fareham West, Titchfield, Stubbington & Lee-on-the-Solent', 'PO12, PO13, PO14, PO16', 12100, 544.00, '[]'::jsonb, true),
(8, 'Winchester & Villages', 'SO21, SO22, SO23', 8000, 360.00, '[]'::jsonb, true),
(9, 'Romsey & North Baddesley', 'SO51, SO52', 8600, 387.00, '[]'::jsonb, true),
(10, 'Totton, Marchwood, Hythe & Dibden', 'SO40, SO45', 11000, 495.00, '[]'::jsonb, true),
(11, 'Totton only', 'SO40', 7000, 315.00, '[]'::jsonb, true),
(12, 'Sholing, Itchen, Peartree & Woolston', 'SO19', 7000, 315.00, '[]'::jsonb, true),
(13, 'Hamble, Bursledon & Netley', 'SO31', 9200, 415.00, '[]'::jsonb, true);