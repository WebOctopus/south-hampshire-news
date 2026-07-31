CREATE OR REPLACE FUNCTION public.is_privileged_writer()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.businesses_protect_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
$function$;