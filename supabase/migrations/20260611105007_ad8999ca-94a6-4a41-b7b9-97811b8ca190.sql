ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS vat_rate NUMERIC NOT NULL DEFAULT 0.20,
  ADD COLUMN IF NOT EXISTS vat_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS gross_amount NUMERIC;

INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES ('vat_registration_number', '"GB000000000"'::jsonb, 'string', 'Company VAT registration number shown on invoices')
ON CONFLICT (setting_key) DO NOTHING;