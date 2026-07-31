-- 1. CRM match key
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS crm_company_id text;
CREATE UNIQUE INDEX IF NOT EXISTS businesses_crm_company_id_key ON public.businesses (crm_company_id);

-- 2. directory_areas
CREATE TABLE public.directory_areas (
  area_code int PRIMARY KEY,
  internal_name text NOT NULL,
  postcodes text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.directory_areas TO authenticated;
GRANT ALL ON public.directory_areas TO service_role;

ALTER TABLE public.directory_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active directory areas"
  ON public.directory_areas FOR SELECT TO authenticated
  USING (is_active OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage directory areas"
  ON public.directory_areas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_directory_areas_updated_at
  BEFORE UPDATE ON public.directory_areas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 14 areas from pricing_areas (read-only)
INSERT INTO public.directory_areas (area_code, internal_name, sort_order, is_active)
SELECT pa.sort_order, pa.name, pa.sort_order, true
FROM public.pricing_areas pa
WHERE pa.sort_order BETWEEN 1 AND 14;

-- Seed postcode mapping (authoritative list)
UPDATE public.directory_areas SET postcodes = v.pcs
FROM (VALUES
  (1,  ARRAY['SO14','SO15','SO16','SO17','SO52']),
  (2,  ARRAY['SO53']),
  (3,  ARRAY['SO50']),
  (4,  ARRAY['SO18','SO30']),
  (5,  ARRAY['SO31','PO14','PO15']),
  (6,  ARRAY['PO12','PO13','PO16','PO17']),
  (7,  ARRAY['SO32','PO7','PO17']),
  (8,  ARRAY['SO21','SO22','SO23','SO24']),
  (9,  ARRAY['SO51','SO52']),
  (10, ARRAY['SO40']),
  (11, ARRAY['SO40','SO41','SO42','SO43','SO45']),
  (12, ARRAY['SO19']),
  (13, ARRAY['SO18','SO31']),
  (14, ARRAY['SO20','SO51'])
) AS v(code, pcs)
WHERE directory_areas.area_code = v.code;

-- Out-of-scope regions (inactive)
INSERT INTO public.directory_areas (area_code, internal_name, postcodes, sort_order, is_active) VALUES
  (15, 'Portsmouth (out of scope)', ARRAY['PO1','PO2','PO3','PO4','PO5','PO6','PO8','PO9','PO10','PO11'], 15, false),
  (16, 'Salisbury (out of scope)', ARRAY['SP'], 16, false),
  (17, 'Bournemouth (out of scope)', ARRAY['BH'], 17, false),
  (18, 'Out of area', ARRAY['PO18','PO19','PO20','PO21','PO22','PO23','PO24','PO25','PO26','PO27','PO28','PO29','PO30','PO31','PO32','PO33','PO34','PO35','PO36','PO37','PO38'], 18, false);

-- 3. business_areas
CREATE TABLE public.business_areas (
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  area_code int NOT NULL REFERENCES public.directory_areas(area_code),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, area_code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_areas TO authenticated;
GRANT ALL ON public.business_areas TO service_role;

ALTER TABLE public.business_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage business areas"
  ON public.business_areas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_business_areas_area_code ON public.business_areas (area_code);

-- 4. keywords
CREATE TABLE public.keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  normalised_term text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX keywords_normalised_term_key ON public.keywords (normalised_term);

GRANT SELECT ON public.keywords TO authenticated;
GRANT ALL ON public.keywords TO service_role;

ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view keywords"
  ON public.keywords FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage keywords"
  ON public.keywords FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- business_keywords
CREATE TABLE public.business_keywords (
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  keyword_id uuid NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'crm',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, keyword_id),
  CONSTRAINT business_keywords_source_check CHECK (source IN ('crm','owner'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_keywords TO authenticated;
GRANT ALL ON public.business_keywords TO service_role;

ALTER TABLE public.business_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage business keywords"
  ON public.business_keywords FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Verified owners add own keywords"
  ON public.business_keywords FOR INSERT TO authenticated
  WITH CHECK (
    source = 'owner'
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_keywords.business_id
        AND b.owner_id = auth.uid()
        AND b.is_verified = true
    )
  );

CREATE POLICY "Verified owners remove own keywords"
  ON public.business_keywords FOR DELETE TO authenticated
  USING (
    source = 'owner'
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_keywords.business_id
        AND b.owner_id = auth.uid()
        AND b.is_verified = true
    )
  );

CREATE INDEX idx_business_keywords_keyword_id ON public.business_keywords (keyword_id);

-- Cap owner-added keywords at 2 per business
CREATE OR REPLACE FUNCTION public.enforce_owner_keyword_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  owner_count int;
BEGIN
  IF NEW.source = 'owner' THEN
    SELECT count(*) INTO owner_count
    FROM public.business_keywords
    WHERE business_id = NEW.business_id AND source = 'owner';

    IF owner_count >= 2 THEN
      RAISE EXCEPTION 'A business may have at most 2 owner-added keywords';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_owner_keyword_limit_trigger
  BEFORE INSERT ON public.business_keywords
  FOR EACH ROW EXECUTE FUNCTION public.enforce_owner_keyword_limit();