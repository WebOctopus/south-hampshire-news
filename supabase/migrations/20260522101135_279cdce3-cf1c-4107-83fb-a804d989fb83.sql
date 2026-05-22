CREATE OR REPLACE FUNCTION public.search_businesses_suggest(
  search_term text,
  edition_area_filter text DEFAULT NULL,
  limit_count integer DEFAULT 8
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  sector text,
  city text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.slug, b.name, b.sector, b.city
  FROM public.businesses b
  WHERE b.is_active = true
    AND search_term IS NOT NULL
    AND length(trim(search_term)) >= 2
    AND (
      b.name ILIKE '%' || search_term || '%'
      OR b.description ILIKE '%' || search_term || '%'
      OR b.sector ILIKE '%' || search_term || '%'
      OR b.biz_type ILIKE '%' || search_term || '%'
      OR b.city ILIKE '%' || search_term || '%'
      OR b.postcode ILIKE '%' || search_term || '%'
      OR COALESCE(b.keywords, '') ILIKE '%' || search_term || '%'
    )
    AND (
      edition_area_filter IS NULL
      OR b.edition_area = edition_area_filter
      OR substring(b.edition_area from '^(Area\s*\d+)') = substring(edition_area_filter from '^(Area\s*\d+)')
    )
  ORDER BY
    CASE WHEN b.name ILIKE search_term || '%' THEN 0
         WHEN b.name ILIKE '%' || search_term || '%' THEN 1
         ELSE 2 END,
    b.is_verified DESC NULLS LAST,
    b.name ASC
  LIMIT GREATEST(1, LEAST(limit_count, 20));
$$;

GRANT EXECUTE ON FUNCTION public.search_businesses_suggest(text, text, integer) TO anon, authenticated;