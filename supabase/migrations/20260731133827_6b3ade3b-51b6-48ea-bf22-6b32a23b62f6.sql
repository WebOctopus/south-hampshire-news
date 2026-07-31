-- 1. Directory postcodes (whole location dropdown)
CREATE OR REPLACE FUNCTION public.get_directory_postcodes()
RETURNS TABLE(postcode text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT upper(trim(p)) AS postcode
  FROM public.directory_areas da,
       unnest(da.postcodes) AS p
  WHERE da.is_active = true
    AND p IS NOT NULL AND length(trim(p)) > 0
  ORDER BY 1;
$$;

REVOKE ALL ON FUNCTION public.get_directory_postcodes() FROM public;
GRANT EXECUTE ON FUNCTION public.get_directory_postcodes() TO anon, authenticated;

-- 2. Keyword / business-name suggestions
CREATE OR REPLACE FUNCTION public.suggest_directory_keywords(
  search_term text,
  postcode text DEFAULT NULL,
  limit_count int DEFAULT 8
)
RETURNS TABLE(suggestion text, kind text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      lower(trim(coalesce(search_term, ''))) AS term,
      nullif(upper(trim(coalesce(postcode, ''))), '') AS pc,
      GREATEST(1, LEAST(coalesce(limit_count, 8), 20)) AS lim
  ),
  areas AS (
    SELECT da.area_code
    FROM public.directory_areas da, params p
    WHERE da.is_active = true
      AND p.pc IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM unnest(da.postcodes) AS x WHERE upper(trim(x)) = p.pc
      )
  ),
  live AS (
    SELECT b.id, b.name
    FROM public.businesses b, params p
    WHERE b.is_active = true
      AND coalesce(b.suppressed, false) = false
      AND length(p.term) >= 2
      AND (
        p.pc IS NULL
        OR EXISTS (
          SELECT 1 FROM public.business_areas ba
          WHERE ba.business_id = b.id
            AND ba.area_code IN (SELECT area_code FROM areas)
        )
      )
  ),
  kw AS (
    SELECT DISTINCT k.term AS suggestion, 'keyword'::text AS kind, k.normalised_term AS sort_src
    FROM public.keywords k
    JOIN public.business_keywords bk ON bk.keyword_id = k.id
    JOIN live l ON l.id = bk.business_id
    CROSS JOIN params p
    WHERE k.normalised_term LIKE '%' || p.term || '%'
  ),
  bn AS (
    SELECT DISTINCT l.name AS suggestion, 'business'::text AS kind, lower(l.name) AS sort_src
    FROM live l CROSS JOIN params p
    WHERE lower(l.name) LIKE '%' || p.term || '%'
  ),
  combined AS (
    SELECT * FROM kw UNION ALL SELECT * FROM bn
  )
  SELECT c.suggestion, c.kind
  FROM combined c CROSS JOIN params p
  ORDER BY
    CASE WHEN c.sort_src LIKE p.term || '%' THEN 0 ELSE 1 END,
    CASE WHEN c.kind = 'keyword' THEN 0 ELSE 1 END,
    length(c.suggestion),
    c.suggestion
  LIMIT (SELECT lim FROM params);
$$;

REVOKE ALL ON FUNCTION public.suggest_directory_keywords(text, text, int) FROM public;
GRANT EXECUTE ON FUNCTION public.suggest_directory_keywords(text, text, int) TO anon, authenticated;

-- helper: keyword array for a business
CREATE OR REPLACE FUNCTION public.directory_business_keywords(_business_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(array_agg(DISTINCT k.term ORDER BY k.term), '{}')
  FROM public.business_keywords bk
  JOIN public.keywords k ON k.id = bk.keyword_id
  WHERE bk.business_id = _business_id;
$$;

REVOKE ALL ON FUNCTION public.directory_business_keywords(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.directory_business_keywords(uuid) TO anon, authenticated;

-- helper: postcodes covered by a business
CREATE OR REPLACE FUNCTION public.directory_business_postcodes(_business_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(array_agg(DISTINCT upper(trim(p)) ORDER BY upper(trim(p))), '{}')
  FROM public.business_areas ba
  JOIN public.directory_areas da ON da.area_code = ba.area_code AND da.is_active = true
  CROSS JOIN unnest(da.postcodes) AS p
  WHERE ba.business_id = _business_id
    AND p IS NOT NULL AND length(trim(p)) > 0;
$$;

REVOKE ALL ON FUNCTION public.directory_business_postcodes(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.directory_business_postcodes(uuid) TO anon, authenticated;

-- 3. Main search
CREATE OR REPLACE FUNCTION public.get_public_businesses_v2(
  keyword text DEFAULT NULL,
  postcode text DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, name text, description text, category_id uuid,
  address_line1 text, address_line2 text, city text, postcode_out text,
  website text, logo_url text, featured_image_url text, images text[],
  is_verified boolean, featured boolean, created_at timestamptz, updated_at timestamptz,
  business_categories jsonb, biz_type text, slug text,
  advertises_in_discover boolean, tier text, keywords text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT lower(trim(coalesce(keyword, ''))) AS term,
           nullif(upper(trim(coalesce(postcode, ''))), '') AS pc
  ),
  areas AS (
    SELECT da.area_code FROM public.directory_areas da, params p
    WHERE da.is_active = true AND p.pc IS NOT NULL
      AND EXISTS (SELECT 1 FROM unnest(da.postcodes) x WHERE upper(trim(x)) = p.pc)
  )
  SELECT b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.created_at, b.updated_at,
    to_jsonb(bc.*), b.biz_type, b.slug, b.advertises_in_discover,
    CASE WHEN b.featured THEN 'featured'
         WHEN b.is_verified THEN 'verified'
         ELSE 'recent' END AS tier,
    public.directory_business_keywords(b.id)
  FROM public.businesses b
  LEFT JOIN public.business_categories bc ON bc.id = b.category_id
  CROSS JOIN params p
  WHERE b.is_active = true
    AND coalesce(b.suppressed, false) = false
    AND length(p.term) > 0
    AND p.pc IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.business_areas ba
      WHERE ba.business_id = b.id AND ba.area_code IN (SELECT area_code FROM areas)
    )
    AND (
      lower(b.name) LIKE '%' || p.term || '%'
      OR EXISTS (
        SELECT 1 FROM public.business_keywords bk
        JOIN public.keywords k ON k.id = bk.keyword_id
        WHERE bk.business_id = b.id AND k.normalised_term LIKE '%' || p.term || '%'
      )
    )
  ORDER BY
    CASE WHEN b.featured THEN 0 WHEN b.is_verified THEN 1 ELSE 2 END,
    b.name
  LIMIT GREATEST(0, coalesce(limit_count, 50)) OFFSET GREATEST(0, coalesce(offset_count, 0));
$$;

REVOKE ALL ON FUNCTION public.get_public_businesses_v2(text, text, integer, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_businesses_v2(text, text, integer, integer) TO anon, authenticated;

-- 4. Count
CREATE OR REPLACE FUNCTION public.get_public_businesses_count_v2(
  keyword text DEFAULT NULL,
  postcode text DEFAULT NULL
)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT lower(trim(coalesce(keyword, ''))) AS term,
           nullif(upper(trim(coalesce(postcode, ''))), '') AS pc
  ),
  areas AS (
    SELECT da.area_code FROM public.directory_areas da, params p
    WHERE da.is_active = true AND p.pc IS NOT NULL
      AND EXISTS (SELECT 1 FROM unnest(da.postcodes) x WHERE upper(trim(x)) = p.pc)
  )
  SELECT count(*)::integer
  FROM public.businesses b CROSS JOIN params p
  WHERE b.is_active = true
    AND coalesce(b.suppressed, false) = false
    AND length(p.term) > 0
    AND p.pc IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.business_areas ba
      WHERE ba.business_id = b.id AND ba.area_code IN (SELECT area_code FROM areas)
    )
    AND (
      lower(b.name) LIKE '%' || p.term || '%'
      OR EXISTS (
        SELECT 1 FROM public.business_keywords bk
        JOIN public.keywords k ON k.id = bk.keyword_id
        WHERE bk.business_id = b.id AND k.normalised_term LIKE '%' || p.term || '%'
      )
    );
$$;

REVOKE ALL ON FUNCTION public.get_public_businesses_count_v2(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_businesses_count_v2(text, text) TO anon, authenticated;

-- 5. Verified row
CREATE OR REPLACE FUNCTION public.get_verified_businesses_v2(
  keyword text DEFAULT NULL,
  postcode text DEFAULT NULL,
  limit_count integer DEFAULT 6
)
RETURNS TABLE(
  id uuid, name text, slug text, address_line1 text, address_line2 text,
  city text, postcode_out text, website text, logo_url text, biz_type text,
  category_id uuid, business_categories jsonb,
  advertises_in_discover boolean, is_verified boolean, featured boolean,
  tier text, keywords text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT lower(trim(coalesce(keyword, ''))) AS term,
           nullif(upper(trim(coalesce(postcode, ''))), '') AS pc
  ),
  areas AS (
    SELECT da.area_code FROM public.directory_areas da, params p
    WHERE da.is_active = true AND p.pc IS NOT NULL
      AND EXISTS (SELECT 1 FROM unnest(da.postcodes) x WHERE upper(trim(x)) = p.pc)
  )
  SELECT b.id, b.name, b.slug, b.address_line1, b.address_line2,
    b.city, b.postcode, b.website, b.logo_url, b.biz_type,
    b.category_id, to_jsonb(bc.*), b.advertises_in_discover, b.is_verified, b.featured,
    CASE WHEN b.featured THEN 'featured' ELSE 'verified' END,
    public.directory_business_keywords(b.id)
  FROM public.businesses b
  LEFT JOIN public.business_categories bc ON bc.id = b.category_id
  CROSS JOIN params p
  WHERE b.is_active = true
    AND coalesce(b.suppressed, false) = false
    AND b.is_verified = true
    AND length(p.term) > 0
    AND p.pc IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.business_areas ba
      WHERE ba.business_id = b.id AND ba.area_code IN (SELECT area_code FROM areas)
    )
    AND (
      lower(b.name) LIKE '%' || p.term || '%'
      OR EXISTS (
        SELECT 1 FROM public.business_keywords bk
        JOIN public.keywords k ON k.id = bk.keyword_id
        WHERE bk.business_id = b.id AND k.normalised_term LIKE '%' || p.term || '%'
      )
    )
  ORDER BY b.featured DESC, b.updated_at DESC
  LIMIT GREATEST(0, coalesce(limit_count, 6));
$$;

REVOKE ALL ON FUNCTION public.get_verified_businesses_v2(text, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.get_verified_businesses_v2(text, text, integer) TO anon, authenticated;

-- 6. Recently added row
CREATE OR REPLACE FUNCTION public.get_recently_added_businesses_v2(
  keyword text DEFAULT NULL,
  postcode text DEFAULT NULL,
  limit_count integer DEFAULT 6
)
RETURNS TABLE(
  id uuid, name text, slug text, address_line1 text, address_line2 text,
  city text, postcode_out text, website text, logo_url text, biz_type text,
  category_id uuid, business_categories jsonb, is_verified boolean, featured boolean,
  tier text, keywords text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT lower(trim(coalesce(keyword, ''))) AS term,
           nullif(upper(trim(coalesce(postcode, ''))), '') AS pc
  ),
  areas AS (
    SELECT da.area_code FROM public.directory_areas da, params p
    WHERE da.is_active = true AND p.pc IS NOT NULL
      AND EXISTS (SELECT 1 FROM unnest(da.postcodes) x WHERE upper(trim(x)) = p.pc)
  )
  SELECT b.id, b.name, b.slug, b.address_line1, b.address_line2,
    b.city, b.postcode, b.website, b.logo_url, b.biz_type,
    b.category_id, to_jsonb(bc.*), b.is_verified, b.featured,
    'recent'::text,
    public.directory_business_keywords(b.id)
  FROM public.businesses b
  LEFT JOIN public.business_categories bc ON bc.id = b.category_id
  CROSS JOIN params p
  WHERE b.is_active = true
    AND coalesce(b.suppressed, false) = false
    AND coalesce(b.is_verified, false) = false
    AND coalesce(b.featured, false) = false
    AND length(p.term) > 0
    AND p.pc IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.business_areas ba
      WHERE ba.business_id = b.id AND ba.area_code IN (SELECT area_code FROM areas)
    )
    AND (
      lower(b.name) LIKE '%' || p.term || '%'
      OR EXISTS (
        SELECT 1 FROM public.business_keywords bk
        JOIN public.keywords k ON k.id = bk.keyword_id
        WHERE bk.business_id = b.id AND k.normalised_term LIKE '%' || p.term || '%'
      )
    )
  ORDER BY b.created_at DESC
  LIMIT GREATEST(0, coalesce(limit_count, 6));
$$;

REVOKE ALL ON FUNCTION public.get_recently_added_businesses_v2(text, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.get_recently_added_businesses_v2(text, text, integer) TO anon, authenticated;

-- 7. Detail by slug
CREATE OR REPLACE FUNCTION public.get_business_detail_by_slug_v2(business_slug text)
RETURNS TABLE(
  id uuid, name text, description text, category_id uuid,
  address_line1 text, address_line2 text, city text, postcode_out text,
  website text, logo_url text, featured_image_url text, images text[],
  is_verified boolean, featured boolean, opening_hours jsonb,
  created_at timestamptz, updated_at timestamptz, business_categories jsonb,
  email text, phone text, owner_id uuid, slug text,
  owner_name text, owner_role text, owner_photo_url text, owner_quote text,
  advertises_in_discover boolean,
  facebook_url text, instagram_url text, twitter_url text,
  linkedin_url text, tiktok_url text, youtube_url text,
  postcodes text[], keywords text[], tier text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.name, b.description, b.category_id,
    b.address_line1, b.address_line2, b.city, b.postcode,
    b.website, b.logo_url, b.featured_image_url, b.images,
    b.is_verified, b.featured, b.opening_hours,
    b.created_at, b.updated_at, to_jsonb(bc.*),
    b.email, b.phone, b.owner_id, b.slug,
    b.owner_name, b.owner_role, b.owner_photo_url, b.owner_quote,
    b.advertises_in_discover,
    b.facebook_url, b.instagram_url, b.twitter_url,
    b.linkedin_url, b.tiktok_url, b.youtube_url,
    public.directory_business_postcodes(b.id),
    public.directory_business_keywords(b.id),
    CASE WHEN b.featured THEN 'featured' WHEN b.is_verified THEN 'verified' ELSE 'recent' END
  FROM public.businesses b
  LEFT JOIN public.business_categories bc ON bc.id = b.category_id
  WHERE b.slug = business_slug
    AND b.is_active = true
    AND coalesce(b.suppressed, false) = false;
$$;

REVOKE ALL ON FUNCTION public.get_business_detail_by_slug_v2(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_business_detail_by_slug_v2(text) TO anon, authenticated;

-- 8. Detail by id
CREATE OR REPLACE FUNCTION public.get_business_detail_v2(business_id uuid)
RETURNS TABLE(
  id uuid, name text, description text, category_id uuid,
  address_line1 text, address_line2 text, city text, postcode_out text,
  website text, logo_url text, featured_image_url text, images text[],
  is_verified boolean, featured boolean, opening_hours jsonb,
  created_at timestamptz, updated_at timestamptz, business_categories jsonb,
  email text, phone text, owner_id uuid, slug text,
  owner_name text, owner_role text, owner_photo_url text, owner_quote text,
  advertises_in_discover boolean,
  facebook_url text, instagram_url text, twitter_url text,
  linkedin_url text, tiktok_url text, youtube_url text,
  postcodes text[], keywords text[], tier text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
    b.linkedin_url, b.tiktok_url, b.youtube_url,
    public.directory_business_postcodes(b.id),
    public.directory_business_keywords(b.id),
    CASE WHEN b.featured THEN 'featured' WHEN b.is_verified THEN 'verified' ELSE 'recent' END
  FROM public.businesses b
  LEFT JOIN public.business_categories bc ON bc.id = b.category_id
  WHERE b.id = business_id
    AND b.is_active = true
    AND coalesce(b.suppressed, false) = false;
$$;

REVOKE ALL ON FUNCTION public.get_business_detail_v2(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_business_detail_v2(uuid) TO anon, authenticated;