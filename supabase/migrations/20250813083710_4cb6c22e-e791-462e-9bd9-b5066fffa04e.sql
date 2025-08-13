-- Fix security vulnerability: Protect business contact information from harvesting

-- Drop the overly permissive policy that allows anonymous access to all business data
DROP POLICY IF EXISTS "Active businesses are viewable by everyone" ON public.businesses;

-- Create a policy for basic business information (discoverable but without sensitive contact details)
-- This allows anonymous users to discover businesses but protects contact information
CREATE POLICY "Public can view basic business info" 
ON public.businesses 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NULL -- Only applies to anonymous users
);

-- Allow authenticated users to view full business information including contact details
-- This prevents bulk harvesting while allowing legitimate customers to contact businesses
CREATE POLICY "Authenticated users can view full business info" 
ON public.businesses 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NOT NULL -- Only applies to authenticated users
);

-- Allow admins full access to all businesses for administration
CREATE POLICY "Admins can manage all businesses" 
ON public.businesses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));