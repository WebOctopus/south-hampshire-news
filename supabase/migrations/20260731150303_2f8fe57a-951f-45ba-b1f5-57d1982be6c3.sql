CREATE OR REPLACE FUNCTION public.add_owner_business_keyword(_business_id uuid, _term text)
RETURNS TABLE(out_keyword_id uuid, out_term text, out_source text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_business record;
  v_clean text;
  v_norm text;
  v_kw_id uuid;
  v_source text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_is_admin := public.has_role(auth.uid(), 'admin'::app_role);

  SELECT b.id, b.name, b.owner_id, b.is_verified
    INTO v_business
  FROM public.businesses b
  WHERE b.id = _business_id;

  IF v_business.id IS NULL THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF NOT v_is_admin
     AND NOT (v_business.owner_id IS NOT DISTINCT FROM auth.uid()
              AND coalesce(v_business.is_verified, false)) THEN
    RAISE EXCEPTION 'Only the verified owner of this listing can add keywords';
  END IF;

  v_source := CASE WHEN v_is_admin AND v_business.owner_id IS DISTINCT FROM auth.uid() THEN 'admin' ELSE 'owner' END;

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
    IF v_clean !~ '^[A-Za-z0-9 &\-]+$' THEN
      RAISE EXCEPTION 'Keywords can only contain letters, numbers, spaces, hyphens and ampersands';
    END IF;

    INSERT INTO public.keywords (term, normalised_term, created_by_owner)
    VALUES (v_clean, v_norm, v_source = 'owner')
    RETURNING id INTO v_kw_id;
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

REVOKE EXECUTE ON FUNCTION public.add_owner_business_keyword(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_owner_business_keyword(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_owner_business_keyword(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_owner_business_keyword(uuid, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.directory_business_keywords(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.directory_business_keywords(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.directory_business_keywords(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.directory_business_keywords(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.directory_business_postcodes(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.directory_business_postcodes(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.directory_business_postcodes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.directory_business_postcodes(uuid) TO service_role;