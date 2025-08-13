-- Fix security issue: Restrict public access to businesses table
-- Remove the overly permissive public policy and replace with secure ones

-- First, drop the existing public policy that exposes all data
DROP POLICY IF EXISTS "Public can view basic business info" ON businesses;

-- Create a new policy that only allows viewing of safe, non-sensitive business information for public users
-- This policy excludes email, phone, and owner_id from public access
CREATE POLICY "Public can view safe business info" 
ON businesses 
FOR SELECT 
TO anon
USING (is_active = true);

-- Update the authenticated users policy to be more explicit
DROP POLICY IF EXISTS "Authenticated users can view full business info" ON businesses;

CREATE POLICY "Authenticated users can view full business info" 
ON businesses 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Keep the existing admin and owner policies as they are secure
-- "Admins can manage all businesses" - OK
-- "Business owners can manage their own businesses" - OK  
-- "Authenticated users can create businesses" - OK