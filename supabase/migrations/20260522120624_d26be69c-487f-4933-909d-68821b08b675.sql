CREATE OR REPLACE FUNCTION public.get_users_for_owner_assignment()
RETURNS TABLE(user_id uuid, display_name text, company text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.company, u.email::text
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY COALESCE(p.display_name, u.email) ASC;
$$;

REVOKE ALL ON FUNCTION public.get_users_for_owner_assignment() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_users_for_owner_assignment() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_users_for_owner_assignment() TO authenticated;