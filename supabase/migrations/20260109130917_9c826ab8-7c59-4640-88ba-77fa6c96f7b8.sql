-- Create a function to get distinct edition areas efficiently
CREATE OR REPLACE FUNCTION public.get_distinct_edition_areas()
RETURNS TABLE(edition_area TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT DISTINCT b.edition_area
  FROM businesses b
  WHERE b.is_active = true
    AND b.edition_area IS NOT NULL
  ORDER BY b.edition_area;
$$;