-- Create secure function to get active alerts
CREATE OR REPLACE FUNCTION public.get_active_alerts()
RETURNS TABLE(
  id uuid,
  title text,
  message text,
  alert_type text,
  is_active boolean,
  priority integer,
  badge_text text,
  badge_color text,
  expires_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.title,
    a.message,
    a.alert_type,
    a.is_active,
    a.priority,
    a.badge_text,
    a.badge_color,
    a.expires_at
  FROM alerts a
  WHERE a.is_active = true 
    AND (a.expires_at IS NULL OR a.expires_at > now())
  ORDER BY a.priority ASC, a.created_at DESC;
$$;

-- Grant execute to anonymous users (public access)
GRANT EXECUTE ON FUNCTION public.get_active_alerts() TO anon;
GRANT EXECUTE ON FUNCTION public.get_active_alerts() TO authenticated;