-- Drop the old policy that only works for anonymous users
DROP POLICY IF EXISTS "Anyone can view pricing areas" ON pricing_areas;

-- Create new policy that works for both anonymous AND authenticated users
CREATE POLICY "Anyone can view active pricing areas" 
ON pricing_areas 
FOR SELECT 
TO public, authenticated
USING (is_active = true);