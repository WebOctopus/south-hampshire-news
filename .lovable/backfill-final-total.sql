-- Backfill: subscription pricing models only (currently just 'bogof').
-- Explicitly EXCLUDES 'fixed' (Pay-As-You-Go, priced per issue, e.g.
-- booking d3a77152 — final_total £540 = £180 × 3 issues is correct).
--
-- WRITTEN, NOT EXECUTED. Run preview SELECTs first, then the UPDATEs,
-- via the Supabase SQL Editor.

-- Preview affected bookings
SELECT id, pricing_model, monthly_price, final_total,
       ROUND(monthly_price * 6, 2) AS corrected_final_total
FROM public.bookings
WHERE pricing_model = 'bogof'
  AND monthly_price IS NOT NULL AND monthly_price > 0
  AND (final_total IS NULL OR final_total <> ROUND(monthly_price * 6, 2));

-- Preview affected quotes
SELECT id, pricing_model, monthly_price, final_total,
       ROUND(monthly_price * 6, 2) AS corrected_final_total
FROM public.quotes
WHERE pricing_model = 'bogof'
  AND monthly_price IS NOT NULL AND monthly_price > 0
  AND (final_total IS NULL OR final_total <> ROUND(monthly_price * 6, 2));

-- Apply (run inside a transaction if you want to verify before commit)
-- BEGIN;
UPDATE public.bookings
SET final_total = ROUND(monthly_price * 6, 2)
WHERE pricing_model = 'bogof'
  AND monthly_price IS NOT NULL AND monthly_price > 0
  AND (final_total IS NULL OR final_total <> ROUND(monthly_price * 6, 2));

UPDATE public.quotes
SET final_total = ROUND(monthly_price * 6, 2)
WHERE pricing_model = 'bogof'
  AND monthly_price IS NOT NULL AND monthly_price > 0
  AND (final_total IS NULL OR final_total <> ROUND(monthly_price * 6, 2));
-- COMMIT;