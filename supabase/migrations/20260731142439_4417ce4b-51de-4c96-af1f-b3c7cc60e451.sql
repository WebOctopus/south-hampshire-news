-- Owners can read the keywords on their own listing
CREATE POLICY "Owners view own business keywords"
ON public.business_keywords
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_keywords.business_id
      AND b.owner_id = auth.uid()
  )
);

-- Flag terms created by business owners so admins can review them
ALTER TABLE public.keywords
  ADD COLUMN IF NOT EXISTS created_by_owner boolean NOT NULL DEFAULT false;

-- Owner-facing keyword add: validates, de-duplicates, links
CREATE OR REPLACE FUNCTION public.add_owner_business_keyword(_business_id uuid, _term text)
RETURNS TABLE(keyword_id uuid, term text, source text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean := public.has_role(auth.uid(), 'admin'::app_role);
  v_business record;
  v_clean text;
  v_norm text;
  v_kw_id uuid;
  v_is_new boolean := false;
  v_source text;
BEGIN
  SELECT b.id, b.name, b.owner_id, b.is_verified
    INTO v_business
  FROM public.businesses b
  WHERE b.id = _business_id;

  IF v_business.id IS NULL THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF NOT v_is_admin AND NOT (v_business.owner_id = auth.uid() AND v_business.is_verified) THEN
    RAISE EXCEPTION 'Only the verified owner of this listing can add keywords';
  END IF;

  v_source := CASE WHEN v_is_admin AND v_business.owner_id IS DISTINCT FROM auth.uid() THEN 'admin' ELSE 'owner' END;

  -- collapse internal whitespace and trim
  v_clean := btrim(regexp_replace(coalesce(_term, ''), '\s+', ' ', 'g'));
  v_norm := lower(v_clean);

  IF length(v_clean) < 2 OR length(v_clean) > 40 THEN
    RAISE EXCEPTION 'Keywords must be between 2 and 40 characters';
  END IF;

  IF v_norm = lower(btrim(regexp_replace(coalesce(v_business.name, ''), '\s+', ' ', 'g'))) THEN
    RAISE EXCEPTION 'A keyword cannot just be your business name — use the services or trades people search for';
  END IF;

  SELECT k.id INTO v_kw_id FROM public.keywords k WHERE k.normalised_term = v_norm LIMIT 1;

  IF v_kw_id IS NULL THEN
    -- Only newly created terms enter the shared list, so they are validated strictly
    IF v_clean !~ '^[A-Za-z0-9 &\-]+$' THEN
      RAISE EXCEPTION 'Keywords can only contain letters, numbers, spaces, hyphens and ampersands';
    END IF;

    INSERT INTO public.keywords (term, normalised_term, created_by_owner)
    VALUES (v_clean, v_norm, v_source = 'owner')
    RETURNING id INTO v_kw_id;
    v_is_new := true;
  END IF;

  INSERT INTO public.business_keywords (business_id, keyword_id, source)
  VALUES (_business_id, v_kw_id, v_source)
  ON CONFLICT (business_id, keyword_id) DO NOTHING;

  RETURN QUERY
  SELECT k.id, k.term, v_source
  FROM public.keywords k
  WHERE k.id = v_kw_id;
END;
$$;

REVOKE ALL ON FUNCTION public.add_owner_business_keyword(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_owner_business_keyword(uuid, text) TO authenticated;

-- Admin report of owner-created terms
CREATE OR REPLACE FUNCTION public.admin_list_owner_keywords()
RETURNS TABLE(
  keyword_id uuid,
  term text,
  normalised_term text,
  created_at timestamptz,
  owner_link_count integer,
  total_link_count integer,
  businesses text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT k.id,
         k.term,
         k.normalised_term,
         k.created_at,
         count(*) FILTER (WHERE bk.source = 'owner')::int,
         count(bk.*)::int,
         coalesce(array_agg(DISTINCT b.name) FILTER (WHERE b.name IS NOT NULL), '{}')
  FROM public.keywords k
  LEFT JOIN public.business_keywords bk ON bk.keyword_id = k.id
  LEFT JOIN public.businesses b ON b.id = bk.business_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND (
      k.created_by_owner = true
      OR EXISTS (SELECT 1 FROM public.business_keywords x WHERE x.keyword_id = k.id AND x.source = 'owner')
    )
  GROUP BY k.id, k.term, k.normalised_term, k.created_at
  ORDER BY k.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_list_owner_keywords() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_owner_keywords() TO authenticated;