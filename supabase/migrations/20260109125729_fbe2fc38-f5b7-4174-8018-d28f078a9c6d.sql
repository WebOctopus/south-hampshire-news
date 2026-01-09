-- Drop all existing overloads of get_public_businesses
DROP FUNCTION IF EXISTS public.get_public_businesses(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_public_businesses(uuid, text, integer, integer, text);

-- Drop all existing overloads of get_public_businesses_count
DROP FUNCTION IF EXISTS public.get_public_businesses_count(uuid, text);
DROP FUNCTION IF EXISTS public.get_public_businesses_count(uuid, text, text);

-- Recreate get_public_businesses with edition_area_filter
CREATE OR REPLACE FUNCTION public.get_public_businesses(
  category_filter UUID DEFAULT NULL,
  search_term TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0,
  edition_area_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category_id UUID,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  website TEXT,
  logo_url TEXT,
  featured_image_url TEXT,
  images TEXT[],
  is_verified BOOLEAN,
  featured BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  business_categories JSONB,
  biz_type TEXT
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
    AND (edition_area_filter IS NULL OR b.edition_area ILIKE '%' || edition_area_filter || '%')
  ORDER BY b.featured DESC, b.name
  LIMIT limit_count
  OFFSET offset_count;
$$;

-- Recreate get_public_businesses_count with edition_area_filter
CREATE OR REPLACE FUNCTION public.get_public_businesses_count(
  category_filter UUID DEFAULT NULL,
  search_term TEXT DEFAULT NULL,
  edition_area_filter TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER
  FROM businesses b
  WHERE b.is_active = true
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (search_term IS NULL OR 
         b.name ILIKE '%' || search_term || '%' OR
         b.description ILIKE '%' || search_term || '%' OR
         b.city ILIKE '%' || search_term || '%' OR
         b.postcode ILIKE '%' || search_term || '%')
    AND (edition_area_filter IS NULL OR b.edition_area ILIKE '%' || edition_area_filter || '%');
$$;