-- Populate category_id based on biz_type prefix mapping
-- This enables the category filter to work on imported CSV data

UPDATE businesses SET category_id = '0a2993e6-7d98-4915-a70b-3abe0ca2e00e' WHERE biz_type LIKE 'BIZ%' AND category_id IS NULL;
UPDATE businesses SET category_id = '23dbe6d6-6c00-404e-931f-c8c9723e0e15' WHERE biz_type LIKE 'CH %' AND category_id IS NULL;
UPDATE businesses SET category_id = '5b69e048-c20d-4731-b274-724f2aa69d6d' WHERE biz_type LIKE 'CL %' AND category_id IS NULL;
UPDATE businesses SET category_id = '207bedfc-4dda-4681-8883-2592b070e449' WHERE biz_type LIKE 'COM%' AND category_id IS NULL;
UPDATE businesses SET category_id = '5c4df9d8-f535-4187-bb67-08b019356c20' WHERE biz_type LIKE 'EAT%' AND category_id IS NULL;
UPDATE businesses SET category_id = '659ea5b9-d9e8-4961-bb68-42f217e8fa9d' WHERE biz_type LIKE 'EDU%' AND category_id IS NULL;
UPDATE businesses SET category_id = '23d9cf19-c161-497e-82d4-a8ffcc8ae77c' WHERE biz_type LIKE 'ENT%' AND category_id IS NULL;
UPDATE businesses SET category_id = '10829fd4-c412-4d52-a372-02ff4711fbf1' WHERE biz_type LIKE 'HB %' AND category_id IS NULL;
UPDATE businesses SET category_id = 'a91eed1b-53eb-488e-8b5f-9cc4e3faf47d' WHERE biz_type LIKE 'HG %' AND category_id IS NULL;
UPDATE businesses SET category_id = 'd270d8dc-2574-4c8e-828e-7783c9e27f53' WHERE biz_type LIKE 'HIN%' AND category_id IS NULL;
UPDATE businesses SET category_id = '4e6181ed-4fc8-4e13-a6e4-9fc01a5d7c74' WHERE biz_type LIKE 'HOL%' AND category_id IS NULL;
UPDATE businesses SET category_id = '7fe496a8-d411-4a1d-a095-60502b7c9c42' WHERE biz_type LIKE 'HPR%' AND category_id IS NULL;
UPDATE businesses SET category_id = 'b409a053-8029-482a-a500-dd52488e0b4f' WHERE biz_type LIKE 'LEI%' AND category_id IS NULL;
UPDATE businesses SET category_id = '8f4171a8-de74-474a-b91b-991cf0b7aeee' WHERE biz_type LIKE 'MED%' AND category_id IS NULL;
UPDATE businesses SET category_id = 'b824e016-4213-421d-ae79-07c4992c27b5' WHERE biz_type LIKE 'MOT%' AND category_id IS NULL;
UPDATE businesses SET category_id = 'c2bd5957-eb4a-4428-b58b-e3447da95fa1' WHERE biz_type LIKE 'MOV%' AND category_id IS NULL;
UPDATE businesses SET category_id = '8536a70c-bd0a-4163-a73e-ccd5a3d8b7d8' WHERE biz_type LIKE 'PAR%' AND category_id IS NULL;
UPDATE businesses SET category_id = '4c172e6c-8e4d-491d-8d69-ad4a425f6a69' WHERE biz_type LIKE 'PS %' AND category_id IS NULL;
UPDATE businesses SET category_id = '5790bfc6-b3bb-4659-a697-dd2f818a60ae' WHERE biz_type LIKE 'PET%' AND category_id IS NULL;
UPDATE businesses SET category_id = '701c90ce-4a55-4d85-8975-d8381dec95b8' WHERE biz_type LIKE 'PRO%' AND category_id IS NULL;
UPDATE businesses SET category_id = '3b0b74e1-655a-42e2-a1f1-9997a1a9d85d' WHERE biz_type LIKE 'RET%' AND category_id IS NULL;
UPDATE businesses SET category_id = '5581c6b4-085b-4a8a-ae9e-5f4a2d53e305' WHERE biz_type LIKE 'SPO%' AND category_id IS NULL;
UPDATE businesses SET category_id = '9c4586a3-875c-4c5e-9224-041f3a6d3e33' WHERE biz_type LIKE 'SRL%' AND category_id IS NULL;