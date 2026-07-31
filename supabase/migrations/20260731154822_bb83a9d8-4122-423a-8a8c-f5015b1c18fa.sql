-- 1. Constraints and owner guard rails
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS unique_owner_business;
DROP INDEX IF EXISTS public.unique_owner_business;
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON public.businesses;

CREATE OR REPLACE FUNCTION public.is_privileged_writer()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('postgres', 'supabase_admin', 'service_role', 'supabase_auth_admin') THEN
    RETURN true;
  END IF;
  IF coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
    RETURN true;
  END IF;
  IF auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_privileged_writer() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_privileged_writer() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.businesses_protect_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_field text := NULL;
BEGIN
  IF public.is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  IF NEW.featured IS DISTINCT FROM OLD.featured THEN v_field := 'featured';
  ELSIF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN v_field := 'is_verified';
  ELSIF NEW.suppressed IS DISTINCT FROM OLD.suppressed THEN v_field := 'suppressed';
  ELSIF NEW.is_active IS DISTINCT FROM OLD.is_active THEN v_field := 'is_active';
  ELSIF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN v_field := 'owner_id';
  ELSIF NEW.crm_company_id IS DISTINCT FROM OLD.crm_company_id THEN v_field := 'crm_company_id';
  END IF;

  IF v_field IS NOT NULL THEN
    RAISE EXCEPTION 'Only an administrator can change "%" on a listing. Please contact the Discover team if this needs updating.', v_field;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_businesses_protect_admin_fields ON public.businesses;
CREATE TRIGGER trg_businesses_protect_admin_fields
BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.businesses_protect_admin_fields();

-- 2. Claim flow
ALTER TABLE public.business_claim_requests
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_business_claim_requests_updated_at ON public.business_claim_requests;
CREATE TRIGGER trg_business_claim_requests_updated_at
BEFORE UPDATE ON public.business_claim_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.business_claim_requests
  DROP CONSTRAINT IF EXISTS business_claim_requests_business_id_user_id_key;
DROP INDEX IF EXISTS public.business_claim_requests_business_id_user_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_claim_per_business_user
  ON public.business_claim_requests (business_id, user_id)
  WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.approve_business_claim(_claim_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim record;
  v_business record;
  v_existing_owner_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only an administrator can approve a claim';
  END IF;

  SELECT * INTO v_claim FROM public.business_claim_requests WHERE id = _claim_id;
  IF v_claim.id IS NULL THEN
    RAISE EXCEPTION 'Claim request not found';
  END IF;
  IF v_claim.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'This claim has already been % and cannot be approved again', v_claim.status;
  END IF;

  SELECT * INTO v_business FROM public.businesses WHERE id = v_claim.business_id;
  IF v_business.id IS NULL THEN
    RAISE EXCEPTION 'The listing for this claim no longer exists';
  END IF;

  IF v_business.owner_id IS NOT NULL
     AND NOT (v_business.owner_id IS NOT DISTINCT FROM v_claim.user_id) THEN
    SELECT u.email::text INTO v_existing_owner_email FROM auth.users u WHERE u.id = v_business.owner_id;
    RAISE EXCEPTION 'This listing is already owned by % (user %). Transfer or clear the existing owner before approving this claim.',
      coalesce(v_existing_owner_email, 'another account'), v_business.owner_id;
  END IF;

  UPDATE public.businesses
     SET owner_id = v_claim.user_id,
         is_verified = true,
         updated_at = now()
   WHERE id = v_business.id;

  UPDATE public.business_claim_requests
     SET status = 'approved',
         reviewed_at = now(),
         reviewed_by = auth.uid()
   WHERE id = _claim_id;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_business_claim(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_business_claim(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reject_business_claim(_claim_id uuid, _reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only an administrator can reject a claim';
  END IF;

  SELECT * INTO v_claim FROM public.business_claim_requests WHERE id = _claim_id;
  IF v_claim.id IS NULL THEN
    RAISE EXCEPTION 'Claim request not found';
  END IF;
  IF v_claim.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'This claim has already been %', v_claim.status;
  END IF;

  UPDATE public.business_claim_requests
     SET status = 'rejected',
         admin_notes = nullif(btrim(coalesce(_reason, '')), ''),
         reviewed_at = now(),
         reviewed_by = auth.uid()
   WHERE id = _claim_id;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reject_business_claim(uuid, text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_business_claim(uuid, text) TO authenticated, service_role;

-- 3. Removal flow
CREATE TABLE IF NOT EXISTS public.business_removal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  relationship text,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

REVOKE ALL ON public.business_removal_requests FROM anon;
GRANT SELECT, UPDATE ON public.business_removal_requests TO authenticated;
GRANT ALL ON public.business_removal_requests TO service_role;

ALTER TABLE public.business_removal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view removal requests" ON public.business_removal_requests;
CREATE POLICY "Admins can view removal requests"
ON public.business_removal_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update removal requests" ON public.business_removal_requests;
CREATE POLICY "Admins can update removal requests"
ON public.business_removal_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_business_removal_requests_updated_at ON public.business_removal_requests;
CREATE TRIGGER trg_business_removal_requests_updated_at
BEFORE UPDATE ON public.business_removal_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_business_removal_requests_business ON public.business_removal_requests (business_id);
CREATE INDEX IF NOT EXISTS idx_business_removal_requests_status ON public.business_removal_requests (status);
CREATE INDEX IF NOT EXISTS idx_business_removal_requests_email ON public.business_removal_requests (lower(requester_email));

CREATE OR REPLACE FUNCTION public.submit_business_removal_request(
  _business_id uuid,
  _name text,
  _email text,
  _relationship text,
  _reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := btrim(coalesce(_name, ''));
  v_email text := lower(btrim(coalesce(_email, '')));
  v_reason text := btrim(coalesce(_reason, ''));
  v_recent int;
BEGIN
  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'Please provide your name';
  END IF;
  IF v_email !~ '^[^@\s]+@[^@\s.]+\.[^@\s]+$' OR length(v_email) > 255 THEN
    RAISE EXCEPTION 'Please provide a valid email address';
  END IF;
  IF length(v_reason) < 5 OR length(v_reason) > 2000 THEN
    RAISE EXCEPTION 'Please tell us why this listing should be removed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = _business_id) THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  SELECT count(*) INTO v_recent
  FROM public.business_removal_requests r
  WHERE lower(r.requester_email) = v_email
    AND r.created_at > now() - interval '24 hours';

  IF v_recent >= 3 THEN
    RAISE EXCEPTION 'Too many removal requests from this email address today. Please contact accounts@discovermagazines.co.uk.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.business_removal_requests r
    WHERE r.business_id = _business_id
      AND lower(r.requester_email) = v_email
      AND r.status = 'pending'
  ) THEN
    RETURN true;
  END IF;

  INSERT INTO public.business_removal_requests
    (business_id, requester_name, requester_email, relationship, reason)
  VALUES
    (_business_id, v_name, v_email, nullif(btrim(coalesce(_relationship, '')), ''), v_reason);

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_business_removal_request(uuid, text, text, text, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.approve_business_removal(_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only an administrator can approve a removal request';
  END IF;

  SELECT * INTO v_req FROM public.business_removal_requests WHERE id = _request_id;
  IF v_req.id IS NULL THEN
    RAISE EXCEPTION 'Removal request not found';
  END IF;
  IF v_req.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'This removal request has already been %', v_req.status;
  END IF;

  UPDATE public.businesses
     SET is_active = false,
         suppressed = true,
         updated_at = now()
   WHERE id = v_req.business_id;

  UPDATE public.business_removal_requests
     SET status = 'approved',
         reviewed_at = now(),
         reviewed_by = auth.uid()
   WHERE id = _request_id;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_business_removal(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_business_removal(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reject_business_removal(_request_id uuid, _reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only an administrator can reject a removal request';
  END IF;

  SELECT * INTO v_req FROM public.business_removal_requests WHERE id = _request_id;
  IF v_req.id IS NULL THEN
    RAISE EXCEPTION 'Removal request not found';
  END IF;
  IF v_req.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'This removal request has already been %', v_req.status;
  END IF;

  UPDATE public.business_removal_requests
     SET status = 'rejected',
         admin_notes = nullif(btrim(coalesce(_reason, '')), ''),
         reviewed_at = now(),
         reviewed_by = auth.uid()
   WHERE id = _request_id;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reject_business_removal(uuid, text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_business_removal(uuid, text) TO authenticated, service_role;