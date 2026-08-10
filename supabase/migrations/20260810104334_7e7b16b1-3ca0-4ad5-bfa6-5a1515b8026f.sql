DROP FUNCTION IF EXISTS public.get_public_businesses_v2(text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.get_public_businesses_v2(keyword text DEFAULT NULL::text, postcode text DEFAULT NULL::text, limit_count integer DEFAULT 50, offset_count integer DEFAULT 0)
 RETURNS TABLE(id uuid, name text, description text, category_id uuid, address_line1 text, address_line2 text, city text, postcode_out text, website text, logo_url text, featured_image_url text, images text[], is_verified boolean, featured boolean, created_at timestamp with time zone, updated_at timestamp with time zone, business_categories jsonb, biz_type text, slug text, advertises_in_discover boolean, tier text, keywords text[], facebook_url text, instagram_url text, twitter_url text, linkedin_url text, tiktok_url text, youtube_url text, checkatrade_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH params AS (
    SELECT lower(trim(coalesce(keyword, ''))) AS term,
           nullif(upper(trim(coalesce(postcode, ''))), '') AS pc
  ),
  areas AS (
    SELECT da.area_code FROM public.directory_areas da, params p
    WHERE da.is_active = true AND p.pc IS NOT NULL
      AND EXISTS (SELECT 1 FROM unnest(da.postcodes) x WHERE upper(trim(x)) = p.pc)
  )
  SELECT b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.created_at, b.updated_at,
    to_jsonb(bc.*), b.biz_type, b.slug, b.advertises_in_discover,
    CASE WHEN b.featured THEN 'featured'
         WHEN b.is_verified THEN 'verified'
         ELSE 'recent' END AS tier,
    public.directory_business_keywords(b.id),
    b.facebook_url, b.instagram_url, b.twitter_url, b.linkedin_url,
    b.tiktok_url, b.youtube_url, b.checkatrade_url
  FROM public.businesses b
  LEFT JOIN public.business_categories bc ON bc.id = b.category_id
  CROSS JOIN params p
  WHERE b.is_active = true
    AND coalesce(b.suppressed, false) = false
    AND length(p.term) > 0
    AND p.pc IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.business_areas ba
      WHERE ba.business_id = b.id AND ba.area_code IN (SELECT area_code FROM areas)
    )
    AND (
      lower(b.name) LIKE '%' || p.term || '%'
      OR EXISTS (
        SELECT 1 FROM public.business_keywords bk
        JOIN public.keywords k ON k.id = bk.keyword_id
        WHERE bk.business_id = b.id AND k.normalised_term LIKE '%' || p.term || '%'
      )
    )
  ORDER BY
    CASE WHEN b.featured THEN 0 WHEN b.is_verified THEN 1 ELSE 2 END,
    b.name
  LIMIT GREATEST(0, coalesce(limit_count, 50)) OFFSET GREATEST(0, coalesce(offset_count, 0));
$function$;

REVOKE ALL ON FUNCTION public.get_public_businesses_v2(text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_businesses_v2(text, text, integer, integer) TO anon, authenticated, service_role;