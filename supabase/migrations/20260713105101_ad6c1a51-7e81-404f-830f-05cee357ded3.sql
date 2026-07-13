
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

  -- payments
  SELECT coalesce(jsonb_agg(row ORDER BY (row->>'date') DESC), '[]'::jsonb) INTO v_payments FROM (
    SELECT jsonb_build_object(
      'source','gocardless','kind','one-off','status',gp.status,'amount',gp.amount,
      'date', coalesce(gp.charge_date::timestamptz, gp.created_at)
    ) AS row
    FROM public.gocardless_payments gp
    JOIN public.bookings b ON b.id = gp.booking_id
    WHERE lower(b.email) = v_email
    UNION ALL
    SELECT jsonb_build_object('source','gocardless','kind','mandate','status',gm.status,'amount',NULL,'date',gm.created_at)
    FROM public.gocardless_mandates gm
    LEFT JOIN public.bookings b ON b.id = gm.booking_id
    WHERE (b.id IS NOT NULL AND lower(b.email) = v_email)
       OR (v_user_id IS NOT NULL AND gm.user_id = v_user_id)
    UNION ALL
    SELECT jsonb_build_object('source','gocardless','kind','subscription','status',gs.status,'amount',gs.amount,'date',gs.created_at)
    FROM public.gocardless_subscriptions gs
    LEFT JOIN public.bookings b ON b.id = gs.booking_id
    LEFT JOIN public.gocardless_mandates gm2 ON gm2.gocardless_mandate_id = gs.gocardless_mandate_id
    WHERE (b.id IS NOT NULL AND lower(b.email) = v_email)
       OR (v_user_id IS NOT NULL AND gm2.user_id = v_user_id)
    UNION ALL
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
    SELECT jsonb_build_object('at', coalesce(gm.updated_at, gm.created_at), 'type','payment_confirmed','label','Direct Debit mandate active')
    FROM public.gocardless_mandates gm
    LEFT JOIN public.bookings b ON b.id = gm.booking_id
    WHERE gm.status = 'active'
      AND ((b.id IS NOT NULL AND lower(b.email) = v_email)
           OR (v_user_id IS NOT NULL AND gm.user_id = v_user_id))
    UNION ALL
    SELECT jsonb_build_object('at', coalesce(gs.updated_at, gs.created_at), 'type','payment_confirmed','label','Subscription active')
    FROM public.gocardless_subscriptions gs
    LEFT JOIN public.bookings b ON b.id = gs.booking_id
    LEFT JOIN public.gocardless_mandates gm2 ON gm2.gocardless_mandate_id = gs.gocardless_mandate_id
    WHERE gs.status = 'active'
      AND ((b.id IS NOT NULL AND lower(b.email) = v_email)
           OR (v_user_id IS NOT NULL AND gm2.user_id = v_user_id))
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
    'bookings', v_bookings,
    'quotes', v_quotes,
    'payments', v_payments,
    'activity', v_activity
  );

  RETURN v_result;
END;
$$;
