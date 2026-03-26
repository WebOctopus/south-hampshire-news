ALTER TABLE ad_sizes ADD COLUMN design_fee_subscription numeric DEFAULT 45 NOT NULL;
UPDATE ad_sizes SET design_fee = 95, design_fee_subscription = 45;