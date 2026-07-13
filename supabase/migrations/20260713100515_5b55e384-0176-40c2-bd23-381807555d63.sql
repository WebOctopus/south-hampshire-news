CREATE OR REPLACE FUNCTION public.get_effective_advertiser_status(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stored_status text;
  has_live_recurring boolean;
  has_current_oneoff boolean;
  has_ever_paid boolean;
BEGIN
  IF _user_id IS NULL THEN
    RETURN 'none';
  END IF;

  SELECT advertiser_status INTO stored_status
  FROM public.profiles
  WHERE user_id = _user_id;

  IF stored_status IN ('active', 'lapsed', 'none') THEN
    RETURN stored_status;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    JOIN public.gocardless_mandates m ON m.booking_id = b.id
    WHERE b.user_id = _user_id AND m.status = 'active'
    UNION ALL
    SELECT 1
    FROM public.bookings b
    JOIN public.gocardless_subscriptions s ON s.booking_id = b.id
    WHERE b.user_id = _user_id AND s.status = 'active'
  ) INTO has_live_recurring;

  IF has_live_recurring THEN
    RETURN 'active';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.user_id = _user_id
      AND b.payment_status = 'paid'
      AND (
        (b.distribution_start_date IS NOT NULL AND b.distribution_start_date >= CURRENT_DATE - INTERVAL '2 months')
        OR (b.distribution_start_date IS NULL AND b.updated_at >= CURRENT_DATE - INTERVAL '2 months')
      )
  ) INTO has_current_oneoff;

  IF has_current_oneoff THEN
    RETURN 'active';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.user_id = _user_id
      AND b.payment_status IN ('paid', 'mandate_active', 'subscription_active')
  ) INTO has_ever_paid;

  IF has_ever_paid THEN
    RETURN 'lapsed';
  END IF;

  RETURN 'none';
END;
$function$;