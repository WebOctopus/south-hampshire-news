-- Remove the problematic security definer view
DROP VIEW IF EXISTS public.businesses_public;

-- Remove the current policy and create more granular ones
DROP POLICY IF EXISTS "Public read access with application filtering" ON public.businesses;

-- Create separate policies for authenticated and anonymous users
-- Authenticated users get full access to business data
CREATE POLICY "Authenticated users can view full business details" 
ON public.businesses 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Anonymous users are completely restricted from direct table access
-- They must use application-level filtering through the frontend
CREATE POLICY "Anonymous users restricted access" 
ON public.businesses 
FOR SELECT 
TO anon
USING (false);

-- Create a database function that returns safe business data for public access
CREATE OR REPLACE FUNCTION public.get_public_businesses(
  category_filter uuid DEFAULT NULL,
  search_term text DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
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
  business_categories jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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
    to_jsonb(bc.*) as business_categories
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

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_businesses TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_businesses TO authenticated;