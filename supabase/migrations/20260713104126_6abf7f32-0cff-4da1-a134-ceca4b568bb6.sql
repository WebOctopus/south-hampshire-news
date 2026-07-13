
-- ============================================================
-- admin_list_clients
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_clients()
RETURNS TABLE(
  email text,
  display_name text,
  company text,
  phone text,
  user_id uuid,
  has_account boolean,
  effective_advertiser_status text,
  quote_requests_count integer,
  quotes_count integer,
  bookings_count integer,
  paid_bookings_count integer,
  total_confirmed_spend numeric,
  last_activity_at timestamptz,
  ad_sizes_used text[],
  locations_used text[],
  plan_types_used text[],
  has_confirmed_payment boolean,
  has_accepted_terms boolean,
  has_used_discount boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
    SELECT email, max(ts) AS last_activity_at FROM (
      SELECT lower(qr.email) AS email, GREATEST(qr.created_at, qr.updated_at) AS ts FROM public.quote_requests qr WHERE qr.email IS NOT NULL
      UNION ALL
      SELECT lower(q.email), GREATEST(q.created_at, q.updated_at) FROM public.quotes q WHERE q.email IS NOT NULL
      UNION ALL
      SELECT lower(b.email), GREATEST(b.created_at, b.updated_at) FROM public.bookings b WHERE b.email IS NOT NULL
    ) t GROUP BY email
  ),
  -- Facet: ad sizes used across quotes + bookings
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
  -- Facet: locations — magazine union of selected+bogof paid+free, leafleting selected only
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
  -- Facet: plan types (pricing_model + duration_type)
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
  -- Discount usage flag (only true when a real code string present)
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
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_clients() TO authenticated;

-- ============================================================
-- admin_get_client(p_email text)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_get_client(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_user_id uuid;
  v_result jsonb;
  v_contact jsonb;
  v_account jsonb;
  v_quote_requests jsonb;
  v_quotes jsonb;
  v_bookings jsonb;
  v_payments jsonb;
  v_activity jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  SELECT u.id INTO v_user_id
  FROM auth.users u WHERE lower(u.email::text) = v_email LIMIT 1;

  -- contact
  WITH latest AS (
    SELECT contact_name AS name, company, phone, created_at, 1 AS rnk FROM public.bookings WHERE lower(email) = v_email
    UNION ALL
    SELECT contact_name, company, phone, created_at, 2 FROM public.quotes WHERE lower(email) = v_email
    UNION ALL
    SELECT contact_name, company, phone, created_at, 3 FROM public.quote_requests WHERE lower(email) = v_email
  ),
  best AS (
    SELECT name, company, phone FROM latest ORDER BY rnk ASC, created_at DESC LIMIT 1
  )
  SELECT jsonb_build_object(
    'display_name', coalesce(p.display_name, b.name),
    'company', coalesce(p.company, b.company),
    'email', v_email,
    'phone', coalesce(p.phone, b.phone),
    'user_id', v_user_id,
    'has_account', v_user_id IS NOT NULL
  )
  INTO v_contact
  FROM (SELECT 1) x
  LEFT JOIN public.profiles p ON p.user_id = v_user_id
  LEFT JOIN best b ON true;

  -- account
  IF v_user_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'advertiser_status_setting', p.advertiser_status,
      'effective_advertiser_status', public.get_effective_advertiser_status(v_user_id),
      'agency_name', p.agency_name,
      'is_agency_member', p.is_agency_member,
      'agency_discount_percent', p.agency_discount_percent,
      'discount_type', p.discount_type
    )
    INTO v_account
    FROM public.profiles p WHERE p.user_id = v_user_id;
  ELSE
    v_account := NULL;
  END IF;

  -- Reusable location resolver via subqueries in each list.

  -- quote_requests
  SELECT coalesce(jsonb_agg(row ORDER BY (row->>'created_at')), '[]'::jsonb) INTO v_quote_requests FROM (
    SELECT jsonb_build_object(
      'id', qr.id,
      'created_at', qr.created_at,
      'status', qr.status,
      'pricing_model', qr.pricing_model,
      'ad_size', s.name,
      'duration', CASE WHEN pd.id IS NOT NULL THEN jsonb_build_object('name', pd.name, 'type', pd.duration_type) ELSE NULL END,
      'locations', (
        SELECT coalesce(array_agg(DISTINCT n), '{}') FROM (
          SELECT pa.name AS n FROM unnest(
            CASE WHEN qr.pricing_model IN ('fixed','bogof')
              THEN coalesce(qr.selected_area_ids,'{}') || coalesce(qr.bogof_paid_area_ids,'{}') || coalesce(qr.bogof_free_area_ids,'{}')
              ELSE '{}'::uuid[] END
          ) aid JOIN public.pricing_areas pa ON pa.id = aid
          UNION
          SELECT la.name FROM unnest(
            CASE WHEN qr.pricing_model = 'leafleting' THEN coalesce(qr.selected_area_ids,'{}') ELSE '{}'::uuid[] END
          ) aid JOIN public.leaflet_areas la ON la.id = aid
        ) t
      ),
      'starting_issue', coalesce(qr.selections->>'selectedStartingIssue', qr.distribution_start_date::text),
      'final_total', qr.final_total
    ) AS row
    FROM public.quote_requests qr
    LEFT JOIN public.ad_sizes s ON s.id = qr.ad_size_id
    LEFT JOIN public.pricing_durations pd ON pd.id = qr.duration_id
    WHERE lower(qr.email) = v_email
  ) t;

  -- quotes
  SELECT coalesce(jsonb_agg(row ORDER BY (row->>'created_at')), '[]'::jsonb) INTO v_quotes FROM (
    SELECT jsonb_build_object(
      'id', q.id,
      'created_at', q.created_at,
      'status', q.status,
      'pricing_model', q.pricing_model,
      'ad_size', s.name,
      'duration', CASE WHEN pd.id IS NOT NULL THEN jsonb_build_object('name', pd.name, 'type', pd.duration_type) ELSE NULL END,
      'locations', (
        SELECT coalesce(array_agg(DISTINCT n), '{}') FROM (
          SELECT pa.name AS n FROM unnest(
            CASE WHEN q.pricing_model IN ('fixed','bogof')
              THEN coalesce(q.selected_area_ids,'{}') || coalesce(q.bogof_paid_area_ids,'{}') || coalesce(q.bogof_free_area_ids,'{}')
              ELSE '{}'::uuid[] END
          ) aid JOIN public.pricing_areas pa ON pa.id = aid
          UNION
          SELECT la.name FROM unnest(
            CASE WHEN q.pricing_model = 'leafleting' THEN coalesce(q.selected_area_ids,'{}') ELSE '{}'::uuid[] END
          ) aid JOIN public.leaflet_areas la ON la.id = aid
        ) t
      ),
      'starting_issue', coalesce(q.selections->>'selectedStartingIssue', q.distribution_start_date::text),
      'final_total', q.final_total,
      'terms_viewed_at', q.terms_viewed_at,
      'discount_code', q.selections->'discount'->>'code'
    ) AS row
    FROM public.quotes q
    LEFT JOIN public.ad_sizes s ON s.id = q.ad_size_id
    LEFT JOIN public.pricing_durations pd ON pd.id = q.duration_id
    WHERE lower(q.email) = v_email
  ) t;

  -- bookings
  SELECT coalesce(jsonb_agg(row ORDER BY (row->>'created_at')), '[]'::jsonb) INTO v_bookings FROM (
    SELECT jsonb_build_object(
      'id', b.id,
      'created_at', b.created_at,
      'status', b.status,
      'payment_status', b.payment_status,
      'confirmed', b.payment_status IN ('paid','mandate_active','subscription_active'),
      'pricing_model', b.pricing_model,
      'ad_size', s.name,
      'duration', CASE WHEN pd.id IS NOT NULL THEN jsonb_build_object('name', pd.name, 'type', pd.duration_type) ELSE NULL END,
      'locations', (
        SELECT coalesce(array_agg(DISTINCT n), '{}') FROM (
          SELECT pa.name AS n FROM unnest(
            CASE WHEN b.pricing_model IN ('fixed','bogof')
              THEN coalesce(b.selected_area_ids,'{}') || coalesce(b.bogof_paid_area_ids,'{}') || coalesce(b.bogof_free_area_ids,'{}')
              ELSE '{}'::uuid[] END
          ) aid JOIN public.pricing_areas pa ON pa.id = aid
          UNION
          SELECT la.name FROM unnest(
            CASE WHEN b.pricing_model = 'leafleting' THEN coalesce(b.selected_area_ids,'{}') ELSE '{}'::uuid[] END
          ) aid JOIN public.leaflet_areas la ON la.id = aid
        ) t
      ),
      'bogof_paid', (
        SELECT coalesce(array_agg(pa.name), '{}') FROM unnest(coalesce(b.bogof_paid_area_ids,'{}')) aid
        JOIN public.pricing_areas pa ON pa.id = aid
      ),
      'bogof_free', (
        SELECT coalesce(array_agg(pa.name), '{}') FROM unnest(coalesce(b.bogof_free_area_ids,'{}')) aid
        JOIN public.pricing_areas pa ON pa.id = aid
      ),
      'starting_issue', coalesce(b.selections->>'selectedStartingIssue', b.distribution_start_date::text),
      'final_total', b.final_total,
      'discount_code', b.selections->'discount'->>'code',
      'terms_viewed_at', b.terms_viewed_at,
      'terms_accepted_at', b.terms_accepted_at,
      'invoice_number', (SELECT inv.invoice_number FROM public.invoices inv WHERE inv.booking_id = b.id ORDER BY inv.created_at DESC LIMIT 1)
    ) AS row
    FROM public.bookings b
    LEFT JOIN public.ad_sizes s ON s.id = b.ad_size_id
    LEFT JOIN public.pricing_durations pd ON pd.id = b.duration_id
    WHERE lower(b.email) = v_email
  ) t;

  -- payments — scoped to this client's bookings/user
  SELECT coalesce(jsonb_agg(row ORDER BY (row->>'date') DESC), '[]'::jsonb) INTO v_payments FROM (
    -- GoCardless payments (via booking)
    SELECT jsonb_build_object(
      'source','gocardless','kind','one-off','status',gp.status,'amount',gp.amount,
      'date', coalesce(gp.charge_date::timestamptz, gp.created_at)
    ) AS row
    FROM public.gocardless_payments gp
    JOIN public.bookings b ON b.id = gp.booking_id
    WHERE lower(b.email) = v_email
    UNION ALL
    -- Mandates scoped by booking OR user
    SELECT jsonb_build_object('source','gocardless','kind','mandate','status',gm.status,'amount',NULL,'date',gm.created_at)
    FROM public.gocardless_mandates gm
    LEFT JOIN public.bookings b ON b.id = gm.booking_id
    WHERE (b.id IS NOT NULL AND lower(b.email) = v_email)
       OR (v_user_id IS NOT NULL AND gm.user_id = v_user_id)
    UNION ALL
    -- Subscriptions scoped by booking OR (via mandate) user
    SELECT jsonb_build_object('source','gocardless','kind','subscription','status',gs.status,'amount',gs.amount,'date',gs.created_at)
    FROM public.gocardless_subscriptions gs
    LEFT JOIN public.bookings b ON b.id = gs.booking_id
    LEFT JOIN public.gocardless_mandates gm2 ON gm2.gocardless_mandate_id = gs.gocardless_mandate_id
    WHERE (b.id IS NOT NULL AND lower(b.email) = v_email)
       OR (v_user_id IS NOT NULL AND gm2.user_id = v_user_id)
    UNION ALL
    -- Stripe-confirmed one-offs (paid bookings with no GoCardless payment row)
    SELECT jsonb_build_object('source','stripe','kind','one-off','status','paid','amount',b.final_total,'date',b.updated_at)
    FROM public.bookings b
    WHERE lower(b.email) = v_email
      AND b.payment_status = 'paid'
      AND NOT EXISTS (SELECT 1 FROM public.gocardless_payments gp2 WHERE gp2.booking_id = b.id)
  ) t;

  -- activity timeline
  SELECT coalesce(jsonb_agg(row ORDER BY (row->>'at') ASC), '[]'::jsonb) INTO v_activity FROM (
    SELECT jsonb_build_object('at', qr.created_at, 'type','form_fill','label','Cost Calculator form submitted') AS row
    FROM public.quote_requests qr WHERE lower(qr.email) = v_email
    UNION ALL
    SELECT jsonb_build_object('at', q.created_at, 'type','quote_created','label','Quote saved')
    FROM public.quotes q WHERE lower(q.email) = v_email
    UNION ALL
    SELECT jsonb_build_object('at', b.created_at, 'type','booking_created','label','Booking created')
    FROM public.bookings b WHERE lower(b.email) = v_email
    UNION ALL
    SELECT jsonb_build_object('at', b.terms_accepted_at, 'type','terms_accepted','label','Terms & conditions accepted')
    FROM public.bookings b WHERE lower(b.email) = v_email AND b.terms_accepted_at IS NOT NULL
    UNION ALL
    SELECT jsonb_build_object('at', coalesce(gp.charge_date::timestamptz, gp.created_at), 'type','payment_confirmed','label','GoCardless payment ' || gp.status)
    FROM public.gocardless_payments gp
    JOIN public.bookings b ON b.id = gp.booking_id
    WHERE lower(b.email) = v_email
    UNION ALL
    SELECT jsonb_build_object('at', b.updated_at, 'type','payment_confirmed','label','Stripe payment confirmed')
    FROM public.bookings b
    WHERE lower(b.email) = v_email
      AND b.payment_status = 'paid'
      AND NOT EXISTS (SELECT 1 FROM public.gocardless_payments gp2 WHERE gp2.booking_id = b.id)
    UNION ALL
    SELECT jsonb_build_object('at', esl.created_at, 'type','email', 'label', esl.template_name, 'status', esl.status)
    FROM public.email_send_log esl
    WHERE lower(esl.recipient_email) = v_email
      AND esl.recipient_type = 'customer'
  ) t;

  v_result := jsonb_build_object(
    'contact', v_contact,
    'account', v_account,
    'quote_requests', v_quote_requests,
    'quotes', v_quotes,
    'bookings', v_bookings,
    'payments', v_payments,
    'activity', v_activity
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_client(text) TO authenticated;
