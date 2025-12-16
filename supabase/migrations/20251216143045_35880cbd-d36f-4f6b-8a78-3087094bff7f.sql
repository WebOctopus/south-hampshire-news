-- Drop and recreate get_public_businesses function to include biz_type
DROP FUNCTION IF EXISTS public.get_public_businesses(uuid, text, integer, integer);

CREATE FUNCTION public.get_public_businesses(
  category_filter uuid DEFAULT NULL,
  search_term text DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category_id uuid,
  address_line1 text,
  address_line2 text,
  city text,
  postcode text,
  website text,
  logo_url text,
  featured_image_url text,
  images text[],
  is_verified boolean,
  featured boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  business_categories jsonb,
  biz_type text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    b.id,
    b.name,
    b.description,
    b.category_id,
    b.address_line1,
    b.address_line2,
    b.city,
    b.postcode,
    b.website,
    b.logo_url,
    b.featured_image_url,
    b.images,
    b.is_verified,
    b.featured,
    b.created_at,
    b.updated_at,
    to_jsonb(bc.*) as business_categories,
    b.biz_type
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.is_active = true
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (search_term IS NULL OR 
         b.name ILIKE '%' || search_term || '%' OR
         b.description ILIKE '%' || search_term || '%' OR
         b.city ILIKE '%' || search_term || '%' OR
         b.postcode ILIKE '%' || search_term || '%')
  ORDER BY b.featured DESC, b.name
  LIMIT limit_count
  OFFSET offset_count;
$$;