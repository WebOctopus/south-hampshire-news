CREATE OR REPLACE FUNCTION public.get_verified_businesses(
  limit_count integer DEFAULT 6,
  search_term text DEFAULT NULL,
  category_filter uuid DEFAULT NULL,
  edition_area_filter text DEFAULT NULL,
  tag_filter text DEFAULT NULL
)
 RETURNS TABLE(id uuid, name text, slug text, address_line1 text, address_line2 text, city text, postcode text, website text, logo_url text, biz_type text, category_id uuid, business_categories jsonb, advertises_in_discover boolean, is_verified boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH cat AS (
    SELECT id, name FROM business_categories WHERE id = category_filter
  ),
  area AS (
    SELECT substring(edition_area_filter from '^(Area\s*\d+)') AS area_prefix
  )
  SELECT b.id, b.name, b.slug, b.address_line1, b.address_line2,
    b.city, b.postcode, b.website, b.logo_url, b.biz_type,
    b.category_id, to_jsonb(bc.*) as business_categories,
    b.advertises_in_discover, b.is_verified
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.is_active = true AND b.is_verified = true
    AND (
      category_filter IS NULL
      OR b.category_id = category_filter
      OR b.sector ILIKE (SELECT name FROM cat)
    )
    AND (search_term IS NULL OR
         b.name ILIKE '%' || search_term || '%' OR
         b.description ILIKE '%' || search_term || '%' OR
         b.sector ILIKE '%' || search_term || '%' OR
         b.biz_type ILIKE '%' || search_term || '%' OR
         b.city ILIKE '%' || search_term || '%' OR
         b.postcode ILIKE '%' || search_term || '%' OR
         b.keywords ILIKE '%' || search_term || '%')
    AND (
      edition_area_filter IS NULL
      OR b.edition_area ILIKE '%' || edition_area_filter || '%'
      OR (
        (SELECT area_prefix FROM area) IS NOT NULL
        AND b.edition_area ILIKE (SELECT area_prefix FROM area) || '%'
      )
    )
    AND (tag_filter IS NULL OR b.tag = tag_filter)
  ORDER BY b.featured DESC, b.updated_at DESC
  LIMIT limit_count;
$function$;

CREATE OR REPLACE FUNCTION public.get_recently_added_businesses(
  limit_count integer DEFAULT 6,
  search_term text DEFAULT NULL,
  category_filter uuid DEFAULT NULL,
  edition_area_filter text DEFAULT NULL,
  tag_filter text DEFAULT NULL
)
 RETURNS TABLE(id uuid, name text, slug text, address_line1 text, address_line2 text, city text, postcode text, website text, logo_url text, biz_type text, category_id uuid, business_categories jsonb, is_verified boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH cat AS (
    SELECT id, name FROM business_categories WHERE id = category_filter
  ),
  area AS (
    SELECT substring(edition_area_filter from '^(Area\s*\d+)') AS area_prefix
  )
  SELECT b.id, b.name, b.slug, b.address_line1, b.address_line2,
    b.city, b.postcode, b.website, b.logo_url, b.biz_type,
    b.category_id, to_jsonb(bc.*) as business_categories, b.is_verified
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.is_active = true AND COALESCE(b.is_verified, false) = false
    AND (
      category_filter IS NULL
      OR b.category_id = category_filter
      OR b.sector ILIKE (SELECT name FROM cat)
    )
    AND (search_term IS NULL OR
         b.name ILIKE '%' || search_term || '%' OR
         b.description ILIKE '%' || search_term || '%' OR
         b.sector ILIKE '%' || search_term || '%' OR
         b.biz_type ILIKE '%' || search_term || '%' OR
         b.city ILIKE '%' || search_term || '%' OR
         b.postcode ILIKE '%' || search_term || '%' OR
         b.keywords ILIKE '%' || search_term || '%')
    AND (
      edition_area_filter IS NULL
      OR b.edition_area ILIKE '%' || edition_area_filter || '%'
      OR (
        (SELECT area_prefix FROM area) IS NOT NULL
        AND b.edition_area ILIKE (SELECT area_prefix FROM area) || '%'
      )
    )
    AND (tag_filter IS NULL OR b.tag = tag_filter)
  ORDER BY b.created_at DESC
  LIMIT limit_count;
$function$;