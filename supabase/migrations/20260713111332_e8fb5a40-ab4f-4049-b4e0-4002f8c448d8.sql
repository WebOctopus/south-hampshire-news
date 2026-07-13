CREATE OR REPLACE FUNCTION public.admin_list_clients()
 RETURNS TABLE(email text, display_name text, company text, phone text, user_id uuid, has_account boolean, effective_advertiser_status text, quote_requests_count integer, quotes_count integer, bookings_count integer, paid_bookings_count integer, total_confirmed_spend numeric, last_activity_at timestamp with time zone, ad_sizes_used text[], locations_used text[], plan_types_used text[], has_confirmed_payment boolean, has_accepted_terms boolean, has_used_discount boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH
  emails_raw AS (
    SELECT lower(qr.email) AS email FROM public.quote_requests qr WHERE qr.email IS NOT NULL AND length(trim(qr.email)) > 0
    UNION
    SELECT lower(q.email) FROM public.quotes q WHERE q.email IS NOT NULL AND length(trim(q.email)) > 0
    UNION
    SELECT lower(b.email) FROM public.bookings b WHERE b.email IS NOT NULL AND length(trim(b.email)) > 0
    UNION
    SELECT lower(u.email::text) FROM auth.users u WHERE u.email IS NOT NULL
  ),
  emails AS (SELECT DISTINCT er.email FROM emails_raw er WHERE er.email IS NOT NULL),
  profile_match AS (
    SELECT e.email,
           u.id AS user_id,
           p.display_name AS p_display_name,
           p.company AS p_company,
           p.phone AS p_phone
    FROM emails e
    LEFT JOIN auth.users u ON lower(u.email::text) = e.email
    LEFT JOIN public.profiles p ON p.user_id = u.id
  ),
  contact_union AS (
    SELECT lower(b.email) AS email, b.contact_name AS name, b.company, b.phone, b.created_at, 1 AS rnk
      FROM public.bookings b WHERE b.email IS NOT NULL
    UNION ALL
    SELECT lower(q.email), q.contact_name, q.company, q.phone, q.created_at, 2
      FROM public.quotes q WHERE q.email IS NOT NULL
    UNION ALL
    SELECT lower(qr.email), qr.contact_name, qr.company, qr.phone, qr.created_at, 3
      FROM public.quote_requests qr WHERE qr.email IS NOT NULL
  ),
  latest_contact AS (
    SELECT DISTINCT ON (cu.email) cu.email, cu.name, cu.company, cu.phone
    FROM contact_union cu
    ORDER BY cu.email, cu.rnk ASC, cu.created_at DESC
  ),
  qr_counts AS (
    SELECT lower(qr.email) AS email, count(*)::int AS c FROM public.quote_requests qr WHERE qr.email IS NOT NULL GROUP BY 1
  ),
  q_counts AS (
    SELECT lower(q.email) AS email, count(*)::int AS c FROM public.quotes q WHERE q.email IS NOT NULL GROUP BY 1
  ),
  b_counts AS (
    SELECT lower(b.email) AS email,
           count(*)::int AS total,
           count(*) FILTER (WHERE b.payment_status IN ('paid','mandate_active','subscription_active'))::int AS paid,
           coalesce(sum(b.final_total) FILTER (WHERE b.payment_status IN ('paid','mandate_active','subscription_active')), 0)::numeric AS spend,
           bool_or(b.payment_status IN ('paid','mandate_active','subscription_active')) AS has_conf,
           bool_or(b.terms_accepted_at IS NOT NULL) AS has_terms
    FROM public.bookings b WHERE b.email IS NOT NULL GROUP BY 1
  ),
  activity AS (
    SELECT t.email, max(t.ts) AS last_activity_at FROM (
      SELECT lower(qr.email) AS email, GREATEST(qr.created_at, qr.updated_at) AS ts FROM public.quote_requests qr WHERE qr.email IS NOT NULL
      UNION ALL
      SELECT lower(q.email), GREATEST(q.created_at, q.updated_at) FROM public.quotes q WHERE q.email IS NOT NULL
      UNION ALL
      SELECT lower(b.email), GREATEST(b.created_at, b.updated_at) FROM public.bookings b WHERE b.email IS NOT NULL
    ) t GROUP BY t.email
  ),
  ad_size_rows AS (
    SELECT lower(q.email) AS email, q.ad_size_id FROM public.quotes q WHERE q.email IS NOT NULL AND q.ad_size_id IS NOT NULL
    UNION ALL
    SELECT lower(b.email), b.ad_size_id FROM public.bookings b WHERE b.email IS NOT NULL AND b.ad_size_id IS NOT NULL
  ),
  ad_sizes_facet AS (
    SELECT ar.email, array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS names
    FROM ad_size_rows ar LEFT JOIN public.ad_sizes s ON s.id = ar.ad_size_id
    GROUP BY ar.email
  ),
  loc_rows AS (
    SELECT lower(q.email) AS email, q.pricing_model,
           CASE WHEN q.pricing_model IN ('fixed','bogof')
                THEN coalesce(q.selected_area_ids,'{}') || coalesce(q.bogof_paid_area_ids,'{}') || coalesce(q.bogof_free_area_ids,'{}')
                ELSE coalesce(q.selected_area_ids,'{}')
           END AS area_ids
    FROM public.quotes q WHERE q.email IS NOT NULL
    UNION ALL
    SELECT lower(b.email), b.pricing_model,
           CASE WHEN b.pricing_model IN ('fixed','bogof')
                THEN coalesce(b.selected_area_ids,'{}') || coalesce(b.bogof_paid_area_ids,'{}') || coalesce(b.bogof_free_area_ids,'{}')
                ELSE coalesce(b.selected_area_ids,'{}')
           END
    FROM public.bookings b WHERE b.email IS NOT NULL
    UNION ALL
    SELECT lower(qr.email), qr.pricing_model,
           CASE WHEN qr.pricing_model IN ('fixed','bogof')
                THEN coalesce(qr.selected_area_ids,'{}') || coalesce(qr.bogof_paid_area_ids,'{}') || coalesce(qr.bogof_free_area_ids,'{}')
                ELSE coalesce(qr.selected_area_ids,'{}')
           END
    FROM public.quote_requests qr WHERE qr.email IS NOT NULL
  ),
  loc_exploded AS (
    SELECT lr.email, lr.pricing_model, unnest(lr.area_ids) AS area_id FROM loc_rows lr
  ),
  loc_names AS (
    SELECT le.email, pa.name AS loc_name
      FROM loc_exploded le
      JOIN public.pricing_areas pa ON pa.id = le.area_id
     WHERE le.pricing_model IN ('fixed','bogof')
    UNION
    SELECT le.email, la.name
      FROM loc_exploded le
      JOIN public.leaflet_areas la ON la.id = le.area_id
     WHERE le.pricing_model = 'leafleting'
  ),
  locations_facet AS (
    SELECT ln.email, array_agg(DISTINCT ln.loc_name) AS names FROM loc_names ln GROUP BY ln.email
  ),
  plan_rows AS (
    SELECT lower(q.email) AS email, q.pricing_model, q.duration_id FROM public.quotes q WHERE q.email IS NOT NULL
    UNION ALL
    SELECT lower(b.email), b.pricing_model, b.duration_id FROM public.bookings b WHERE b.email IS NOT NULL
    UNION ALL
    SELECT lower(qr.email), qr.pricing_model, qr.duration_id FROM public.quote_requests qr WHERE qr.email IS NOT NULL
  ),
  plan_types_facet AS (
    SELECT pr.email,
           array_agg(DISTINCT v) FILTER (WHERE v IS NOT NULL) AS names
    FROM (
      SELECT pr.email, pr.pricing_model AS v FROM plan_rows pr WHERE pr.pricing_model IS NOT NULL
      UNION
      SELECT pr.email, pd.duration_type FROM plan_rows pr LEFT JOIN public.pricing_durations pd ON pd.id = pr.duration_id WHERE pd.duration_type IS NOT NULL
    ) x
    JOIN plan_rows pr ON pr.email = x.email
    GROUP BY pr.email
  ),
  disc_rows AS (
    SELECT lower(q.email) AS email, q.selections->'discount'->>'code' AS code FROM public.quotes q WHERE q.email IS NOT NULL
    UNION ALL
    SELECT lower(b.email), b.selections->'discount'->>'code' FROM public.bookings b WHERE b.email IS NOT NULL
  ),
  discount_flag AS (
    SELECT dr.email, bool_or(dr.code IS NOT NULL AND length(trim(dr.code)) > 0) AS used
    FROM disc_rows dr GROUP BY dr.email
  )
  SELECT
    e.email,
    coalesce(pm.p_display_name, lc.name) AS display_name,
    coalesce(pm.p_company, lc.company) AS company,
    coalesce(pm.p_phone, lc.phone) AS phone,
    pm.user_id,
    (pm.user_id IS NOT NULL) AS has_account,
    coalesce(public.get_effective_advertiser_status(pm.user_id), 'none') AS effective_advertiser_status,
    coalesce(qrc.c, 0) AS quote_requests_count,
    coalesce(qc.c, 0) AS quotes_count,
    coalesce(bc.total, 0) AS bookings_count,
    coalesce(bc.paid, 0) AS paid_bookings_count,
    coalesce(bc.spend, 0) AS total_confirmed_spend,
    a.last_activity_at,
    coalesce(af.names, '{}') AS ad_sizes_used,
    coalesce(lf.names, '{}') AS locations_used,
    coalesce(pf.names, '{}') AS plan_types_used,
    coalesce(bc.has_conf, false) AS has_confirmed_payment,
    coalesce(bc.has_terms, false) AS has_accepted_terms,
    coalesce(df.used, false) AS has_used_discount
  FROM emails e
  LEFT JOIN profile_match pm ON pm.email = e.email
  LEFT JOIN latest_contact lc ON lc.email = e.email
  LEFT JOIN qr_counts qrc ON qrc.email = e.email
  LEFT JOIN q_counts qc ON qc.email = e.email
  LEFT JOIN b_counts bc ON bc.email = e.email
  LEFT JOIN activity a ON a.email = e.email
  LEFT JOIN ad_sizes_facet af ON af.email = e.email
  LEFT JOIN locations_facet lf ON lf.email = e.email
  LEFT JOIN plan_types_facet pf ON pf.email = e.email
  LEFT JOIN discount_flag df ON df.email = e.email
  ORDER BY a.last_activity_at DESC NULLS LAST;
END;
$function$;