
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS owner_role text,
  ADD COLUMN IF NOT EXISTS owner_photo_url text,
  ADD COLUMN IF NOT EXISTS owner_quote text,
  ADD COLUMN IF NOT EXISTS advertises_in_discover boolean NOT NULL DEFAULT false;

-- Recreate get_public_businesses with new column
DROP FUNCTION IF EXISTS public.get_public_businesses(uuid, text, integer, integer, text, text);
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
  business_categories jsonb, biz_type text, slug text, tag text,
  advertises_in_discover boolean
)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.created_at, b.updated_at,
    to_jsonb(bc.*) as business_categories,
    b.biz_type, b.slug, b.tag, b.advertises_in_discover
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
  ORDER BY b.featured DESC, b.is_verified DESC, b.name
  LIMIT limit_count OFFSET offset_count;
$$;

-- Recreate detail RPC with new fields
DROP FUNCTION IF EXISTS public.get_business_detail_by_slug(text);
CREATE OR REPLACE FUNCTION public.get_business_detail_by_slug(business_slug text)
RETURNS TABLE(
  id uuid, name text, description text, category_id uuid,
  address_line1 text, address_line2 text, city text, postcode text,
  website text, logo_url text, featured_image_url text, images text[],
  is_verified boolean, featured boolean, opening_hours jsonb,
  created_at timestamp with time zone, updated_at timestamp with time zone,
  business_categories jsonb,
  email text, phone text, owner_id uuid, slug text, tag text,
  owner_name text, owner_role text, owner_photo_url text, owner_quote text,
  advertises_in_discover boolean
)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.opening_hours,
    b.created_at, b.updated_at,
    to_jsonb(bc.*) as business_categories,
    b.email, b.phone, b.owner_id, b.slug, b.tag,
    b.owner_name, b.owner_role, b.owner_photo_url, b.owner_quote,
    b.advertises_in_discover
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.slug = business_slug AND b.is_active = true;
$$;

-- New: verified businesses for "Verified businesses" row (no location gate)
CREATE OR REPLACE FUNCTION public.get_verified_businesses(limit_count integer DEFAULT 6)
RETURNS TABLE(
  id uuid, name text, slug text, address_line1 text, address_line2 text,
  city text, postcode text, website text, logo_url text, biz_type text,
  category_id uuid, business_categories jsonb,
  advertises_in_discover boolean, is_verified boolean
)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT b.id, b.name, b.slug, b.address_line1, b.address_line2,
    b.city, b.postcode, b.website, b.logo_url, b.biz_type,
    b.category_id, to_jsonb(bc.*) as business_categories,
    b.advertises_in_discover, b.is_verified
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.is_active = true AND b.is_verified = true
  ORDER BY b.featured DESC, b.updated_at DESC
  LIMIT limit_count;
$$;

-- New: recently added (unverified)
CREATE OR REPLACE FUNCTION public.get_recently_added_businesses(limit_count integer DEFAULT 6)
RETURNS TABLE(
  id uuid, name text, slug text, address_line1 text, address_line2 text,
  city text, postcode text, website text, logo_url text, biz_type text,
  category_id uuid, business_categories jsonb, is_verified boolean
)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT b.id, b.name, b.slug, b.address_line1, b.address_line2,
    b.city, b.postcode, b.website, b.logo_url, b.biz_type,
    b.category_id, to_jsonb(bc.*) as business_categories, b.is_verified
  FROM businesses b
  LEFT JOIN business_categories bc ON b.category_id = bc.id
  WHERE b.is_active = true AND COALESCE(b.is_verified, false) = false
  ORDER BY b.created_at DESC
  LIMIT limit_count;
$$;
