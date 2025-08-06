-- Fix Multiple Permissive Policies warnings by consolidating redundant policies
-- This will improve Cost Calculator performance by reducing policy evaluation overhead

-- Fix business_categories: Remove duplicate SELECT policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.business_categories;
-- Keep only: "Anyone can view business categories" for SELECT

-- Fix businesses: Remove duplicate SELECT policies  
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can view all active businesses" ON public.businesses;
-- Keep only: "Active businesses are viewable by everyone" for SELECT

-- Fix events: Consolidate duplicate policies
DROP POLICY IF EXISTS "Events are publicly viewable" ON public.events;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
-- Keep only the public SELECT policy
CREATE POLICY "Public events are viewable" ON public.events
FOR SELECT USING (true);

-- Remove the redundant user-specific SELECT policy since public access covers it
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;

-- Fix events: Consolidate duplicate INSERT policies
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
-- Keep only: "Users can create their own events" for INSERT with proper user_id check

-- Create a more efficient single policy for user-owned event management
DROP POLICY IF EXISTS "Users can create their own events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events; 
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

-- Single comprehensive policy for user event management
CREATE POLICY "Users can manage their own events" ON public.events
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix admin policies: Use more efficient single policies instead of separate ones
-- Ad sizes
DROP POLICY IF EXISTS "Admins can manage ad sizes" ON public.ad_sizes;
CREATE POLICY "Admin full access to ad sizes" ON public.ad_sizes
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Pricing areas  
DROP POLICY IF EXISTS "Admins can manage pricing areas" ON public.pricing_areas;
CREATE POLICY "Admin full access to pricing areas" ON public.pricing_areas
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Pricing durations
DROP POLICY IF EXISTS "Admins can manage pricing durations" ON public.pricing_durations;
CREATE POLICY "Admin full access to pricing durations" ON public.pricing_durations
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Volume discounts
DROP POLICY IF EXISTS "Admins can manage volume discounts" ON public.volume_discounts;
CREATE POLICY "Admin full access to volume discounts" ON public.volume_discounts
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Special deals
DROP POLICY IF EXISTS "Admins can manage special deals" ON public.special_deals;
CREATE POLICY "Admin full access to special deals" ON public.special_deals
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- User roles optimization
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Admin full access to user roles" ON public.user_roles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));