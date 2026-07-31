ALTER TABLE public.business_keywords
  DROP CONSTRAINT IF EXISTS business_keywords_source_check;

ALTER TABLE public.business_keywords
  ADD CONSTRAINT business_keywords_source_check
  CHECK (source = ANY (ARRAY['crm'::text, 'owner'::text, 'admin'::text]));