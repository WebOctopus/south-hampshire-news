-- Create a database function that returns safe business detail data for public access
CREATE OR REPLACE FUNCTION public.get_business_detail(business_id uuid)
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
  opening_hours jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  business_categories jsonb,
  -- Sensitive fields only for authenticated users
  email text,
  phone text,
  owner_id uuid
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
    b.opening_hours,
    b.created_at,
    b.updated_at,
    to_jsonb(bc.*) as business_categories,
    -- Only return sensitive fields for authenticated users
    CASE WHEN auth.uid() IS NOT NULL THEN b.email ELSE NULL END as email,
    CASE WHEN auth.uid() IS NOT NULL THEN b.phone ELSE NULL END as phone,
    CASE WHEN auth.uid() IS NOT NULL THEN b.owner_id ELSE NULL END as owner_id
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.id = business_id AND b.is_active = true;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_business_detail TO anon;
GRANT EXECUTE ON FUNCTION public.get_business_detail TO authenticated;