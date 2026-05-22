CREATE OR REPLACE FUNCTION public.get_public_businesses(
  category_filter uuid DEFAULT NULL::uuid,
  search_term text DEFAULT NULL::text,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0,
  edition_area_filter text DEFAULT NULL::text,
  tag_filter text DEFAULT NULL::text
)
RETURNS TABLE(
  id uuid, name text, description text, category_id uuid,
  address_line1 text, address_line2 text, city text, postcode text,
  website text, logo_url text, featured_image_url text, images text[],
  is_verified boolean, featured boolean,
  created_at timestamp with time zone, updated_at timestamp with time zone,
  business_categories jsonb, biz_type text, slug text, tag text,
  advertises_in_discover boolean
)
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
  SELECT b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.created_at, b.updated_at,
    to_jsonb(bc.*) as business_categories,
    b.biz_type, b.slug, b.tag, b.advertises_in_discover
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.is_active = true
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
  ORDER BY b.featured DESC, b.is_verified DESC, b.name
  LIMIT limit_count OFFSET offset_count;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_businesses_count(
  category_filter uuid DEFAULT NULL::uuid,
  search_term text DEFAULT NULL::text,
  edition_area_filter text DEFAULT NULL::text,
  tag_filter text DEFAULT NULL::text
)
RETURNS integer
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
  SELECT COUNT(*)::INTEGER
  FROM businesses b
  WHERE b.is_active = true
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
    AND (tag_filter IS NULL OR b.tag = tag_filter);
$function$;