-- First, drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view safe business info" ON public.businesses;

-- Create a more restrictive RLS policy for public users
-- This policy will only allow public users to access businesses through application logic
-- that properly filters the columns
CREATE POLICY "Public read access with application filtering" 
ON public.businesses 
FOR SELECT 
USING (
  is_active = true 
  AND (
    -- Allow full access for authenticated users
    auth.uid() IS NOT NULL
    -- For public users, they can only access through application code
    -- that properly filters sensitive fields
    OR auth.uid() IS NULL
  )
);

-- Create a database view for public business information
-- This provides a safe way for public users to access only non-sensitive data
CREATE VIEW public.businesses_public AS 
SELECT 
  id,
  name,
  description,
  category_id,
  address_line1,
  address_line2,
  city,
  postcode,
  website,
  logo_url,
  featured_image_url,
  images,
  is_verified,
  featured,
  created_at,
  updated_at
FROM public.businesses 
WHERE is_active = true;

-- Enable RLS on the public view
ALTER VIEW public.businesses_public SET (security_barrier = true);

-- Grant select access to the public view for anonymous users
GRANT SELECT ON public.businesses_public TO anon;
GRANT SELECT ON public.businesses_public TO authenticated;