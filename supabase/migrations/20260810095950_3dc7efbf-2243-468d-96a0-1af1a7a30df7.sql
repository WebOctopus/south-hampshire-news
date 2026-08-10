ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS checkatrade_url text;

DROP FUNCTION IF EXISTS public.get_business_detail_v2(uuid);
CREATE FUNCTION public.get_business_detail_v2(business_id uuid)
 RETURNS TABLE(id uuid, name text, description text, category_id uuid, address_line1 text, address_line2 text, city text, postcode_out text, website text, logo_url text, featured_image_url text, images text[], is_verified boolean, featured boolean, opening_hours jsonb, created_at timestamp with time zone, updated_at timestamp with time zone, business_categories jsonb, email text, phone text, owner_id uuid, slug text, owner_name text, owner_role text, owner_photo_url text, owner_quote text, advertises_in_discover boolean, facebook_url text, instagram_url text, twitter_url text, linkedin_url text, tiktok_url text, youtube_url text, checkatrade_url text, postcodes text[], keywords text[], tier text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.opening_hours,
    b.created_at, b.updated_at, to_jsonb(bc.*),
    CASE WHEN auth.uid() IS NOT NULL THEN b.email ELSE NULL END,
    CASE WHEN auth.uid() IS NOT NULL THEN b.phone ELSE NULL END,
    CASE WHEN auth.uid() IS NOT NULL THEN b.owner_id ELSE NULL END,
    b.slug,
    b.owner_name, b.owner_role, b.owner_photo_url, b.owner_quote,
    b.advertises_in_discover,
    b.facebook_url, b.instagram_url, b.twitter_url,
    b.linkedin_url, b.tiktok_url, b.youtube_url, b.checkatrade_url,
    public.directory_business_postcodes(b.id),
    public.directory_business_keywords(b.id),
    CASE WHEN b.featured THEN 'featured' WHEN b.is_verified THEN 'verified' ELSE 'recent' END
  FROM public.businesses b
  LEFT JOIN public.business_categories bc ON bc.id = b.category_id
  WHERE b.id = business_id
    AND b.is_active = true
    AND coalesce(b.suppressed, false) = false;
$function$;

DROP FUNCTION IF EXISTS public.get_business_detail_by_slug_v2(text);
CREATE FUNCTION public.get_business_detail_by_slug_v2(business_slug text)
 RETURNS TABLE(id uuid, name text, description text, category_id uuid, address_line1 text, address_line2 text, city text, postcode_out text, website text, logo_url text, featured_image_url text, images text[], is_verified boolean, featured boolean, opening_hours jsonb, created_at timestamp with time zone, updated_at timestamp with time zone, business_categories jsonb, email text, phone text, owner_id uuid, slug text, owner_name text, owner_role text, owner_photo_url text, owner_quote text, advertises_in_discover boolean, facebook_url text, instagram_url text, twitter_url text, linkedin_url text, tiktok_url text, youtube_url text, checkatrade_url text, postcodes text[], keywords text[], tier text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.opening_hours,
    b.created_at, b.updated_at, to_jsonb(bc.*),
    b.email, b.phone, b.owner_id, b.slug,
    b.owner_name, b.owner_role, b.owner_photo_url, b.owner_quote,
    b.advertises_in_discover,
    b.facebook_url, b.instagram_url, b.twitter_url,
    b.linkedin_url, b.tiktok_url, b.youtube_url, b.checkatrade_url,
    public.directory_business_postcodes(b.id),
    public.directory_business_keywords(b.id),
    CASE WHEN b.featured THEN 'featured' WHEN b.is_verified THEN 'verified' ELSE 'recent' END
  FROM public.businesses b
  LEFT JOIN public.business_categories bc ON bc.id = b.category_id
  WHERE b.slug = business_slug
    AND b.is_active = true
    AND coalesce(b.suppressed, false) = false;
$function$;

REVOKE ALL ON FUNCTION public.get_business_detail_v2(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_business_detail_by_slug_v2(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_business_detail_v2(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_business_detail_by_slug_v2(text) TO anon, authenticated, service_role;