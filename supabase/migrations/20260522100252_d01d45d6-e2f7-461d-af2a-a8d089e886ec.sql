CREATE OR REPLACE FUNCTION public.get_available_sectors(search_term text DEFAULT NULL, edition_area_filter text DEFAULT NULL)
RETURNS TABLE(category_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH area AS (
    SELECT substring(edition_area_filter from '^(Area\s*\d+)') AS area_prefix
  ),
  matched AS (
    SELECT b.category_id, b.sector
    FROM businesses b
    WHERE b.is_active = true
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
  )
  SELECT DISTINCT bc.id AS category_id
  FROM business_categories bc
  WHERE bc.id IN (SELECT category_id FROM matched WHERE category_id IS NOT NULL)
     OR EXISTS (SELECT 1 FROM matched m WHERE m.sector ILIKE bc.name);
$function$;