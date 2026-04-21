-- Add advertiser_status column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS advertiser_status text NOT NULL DEFAULT 'auto'
CHECK (advertiser_status IN ('auto', 'active', 'lapsed', 'none'));

-- Function to compute effective advertiser status
CREATE OR REPLACE FUNCTION public.get_effective_advertiser_status(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_status text;
  has_live_booking boolean;
  has_past_booking boolean;
BEGIN
  IF _user_id IS NULL THEN
    RETURN 'none';
  END IF;

  SELECT advertiser_status INTO stored_status
  FROM public.profiles
  WHERE user_id = _user_id;

  -- If override set, return it
  IF stored_status IN ('active', 'lapsed', 'none') THEN
    RETURN stored_status;
  END IF;

  -- Auto-derive from bookings
  -- Live = confirmed/active status with no end date or end date >= today
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE user_id = _user_id
      AND status IN ('confirmed', 'active')
      AND (
        distribution_start_date IS NULL
        OR distribution_start_date >= (CURRENT_DATE - INTERVAL '1 year')
      )
  ) INTO has_live_booking;

  IF has_live_booking THEN
    RETURN 'active';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE user_id = _user_id
  ) INTO has_past_booking;

  IF has_past_booking THEN
    RETURN 'lapsed';
  END IF;

  RETURN 'none';
END;
$$;

-- Thin boolean wrapper
CREATE OR REPLACE FUNCTION public.is_advertiser_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_effective_advertiser_status(_user_id) = 'active';
$$;