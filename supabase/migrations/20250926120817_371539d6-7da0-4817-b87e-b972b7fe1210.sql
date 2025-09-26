-- Recreate alerts RLS policies as PERMISSIVE (default)
DROP POLICY IF EXISTS "Active alerts are viewable by everyone" ON public.alerts;
DROP POLICY IF EXISTS "Admin full access to alerts" ON public.alerts;

-- Public can read active alerts
CREATE POLICY "Active alerts are viewable by everyone"
ON public.alerts
FOR SELECT
USING (is_active = true);

-- Admins can do everything on alerts
CREATE POLICY "Admin full access to alerts"
ON public.alerts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));