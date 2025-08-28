-- Remove the overly permissive SELECT policies that allow authenticated users 
-- direct access to all business data including sensitive contact information
DROP POLICY IF EXISTS "Authenticated users can view full business details" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can view full business info" ON businesses;

-- The remaining policies will be:
-- 1. "Anonymous users restricted access" (qual: false) - blocks anonymous access
-- 2. "Admins can manage all businesses" - allows admin access  
-- 3. "Business owners can manage their own businesses" - allows owners to manage their listings
-- 4. "Authenticated users can create businesses" - allows creating new listings

-- All public access must now go through our secure functions:
-- - get_public_businesses() for directory listings (no contact info)
-- - get_business_detail() for individual business pages (contact info only for authenticated users)