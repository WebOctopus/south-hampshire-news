ALTER TABLE public.business_import_batches
  ADD COLUMN IF NOT EXISTS crm_ids text[] NOT NULL DEFAULT '{}';