
-- 1. Wipe directory data
DELETE FROM public.business_claim_requests;
DELETE FROM public.business_reviews;
DELETE FROM public.featured_advertisers WHERE business_id IS NOT NULL;
DELETE FROM public.businesses;

-- 2. Add tag column
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS tag TEXT;

-- 3. Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_tag ON public.businesses (tag) WHERE tag IS NOT NULL;

-- 4. Updated list RPC
DROP FUNCTION IF EXISTS public.get_public_businesses(uuid, text, integer, integer, text);
CREATE OR REPLACE FUNCTION public.get_public_businesses(
  category_filter uuid DEFAULT NULL,
  search_term text DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0,
  edition_area_filter text DEFAULT NULL,
  tag_filter text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, name text, description text, category_id uuid,
  address_line1 text, address_line2 text, city text, postcode text,
  website text, logo_url text, featured_image_url text, images text[],
  is_verified boolean, featured boolean,
  created_at timestamp with time zone, updated_at timestamp with time zone,
  business_categories jsonb, biz_type text, slug text, tag text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.created_at, b.updated_at,
    to_jsonb(bc.*) as business_categories,
    b.biz_type, b.slug, b.tag
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.is_active = true
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (search_term IS NULL OR 
         b.name ILIKE '%' || search_term || '%' OR
         b.description ILIKE '%' || search_term || '%' OR
         b.city ILIKE '%' || search_term || '%' OR
         b.postcode ILIKE '%' || search_term || '%' OR
         b.keywords ILIKE '%' || search_term || '%')
    AND (edition_area_filter IS NULL OR b.edition_area ILIKE '%' || edition_area_filter || '%')
    AND (tag_filter IS NULL OR b.tag = tag_filter)
  ORDER BY b.featured DESC, b.name
  LIMIT limit_count OFFSET offset_count;
$$;

-- 5. Updated count RPC
DROP FUNCTION IF EXISTS public.get_public_businesses_count(uuid, text, text);
CREATE OR REPLACE FUNCTION public.get_public_businesses_count(
  category_filter uuid DEFAULT NULL,
  search_term text DEFAULT NULL,
  edition_area_filter text DEFAULT NULL,
  tag_filter text DEFAULT NULL
)
RETURNS integer
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
         b.postcode ILIKE '%' || search_term || '%' OR
         b.keywords ILIKE '%' || search_term || '%')
    AND (edition_area_filter IS NULL OR b.edition_area ILIKE '%' || edition_area_filter || '%')
    AND (tag_filter IS NULL OR b.tag = tag_filter);
$$;

-- 6. Detail by slug
CREATE OR REPLACE FUNCTION public.get_business_detail_by_slug(business_slug text)
RETURNS TABLE(
  id uuid, name text, description text, category_id uuid,
  address_line1 text, address_line2 text, city text, postcode text,
  website text, logo_url text, featured_image_url text, images text[],
  is_verified boolean, featured boolean, opening_hours jsonb,
  created_at timestamp with time zone, updated_at timestamp with time zone,
  business_categories jsonb, email text, phone text, owner_id uuid,
  slug text, tag text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.opening_hours,
    b.created_at, b.updated_at,
    to_jsonb(bc.*) as business_categories,
    CASE WHEN auth.uid() IS NOT NULL THEN b.email ELSE NULL END as email,
    CASE WHEN auth.uid() IS NOT NULL THEN b.phone ELSE NULL END as phone,
    CASE WHEN auth.uid() IS NOT NULL THEN b.owner_id ELSE NULL END as owner_id,
    b.slug, b.tag
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.slug = business_slug AND b.is_active = true;
$$;

-- 7. Distinct tags
CREATE OR REPLACE FUNCTION public.get_distinct_tags()
RETURNS TABLE(tag text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT b.tag
  FROM businesses b
  WHERE b.is_active = true AND b.tag IS NOT NULL AND b.tag <> ''
  ORDER BY b.tag;
$$;
