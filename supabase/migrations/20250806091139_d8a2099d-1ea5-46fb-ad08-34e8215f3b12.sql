-- Fix Auth RLS Initialization Plan performance warnings
-- Replace auth.uid() with current_setting approach for better performance

-- Drop existing policies that use auth.uid() and recreate with optimized versions

-- Business categories policies
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.business_categories;
CREATE POLICY "Authenticated users can manage categories" ON public.business_categories
FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'sub' IS NOT NULL
);

-- Business reviews policies  
DROP POLICY IF EXISTS "Users can create reviews" ON public.business_reviews;
CREATE POLICY "Users can create reviews" ON public.business_reviews
FOR INSERT WITH CHECK (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.business_reviews;
CREATE POLICY "Users can update their own reviews" ON public.business_reviews
FOR UPDATE USING (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

-- Businesses policies
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON public.businesses;
CREATE POLICY "Authenticated users can create businesses" ON public.businesses
FOR INSERT WITH CHECK (
  owner_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

DROP POLICY IF EXISTS "Business owners can manage their own businesses" ON public.businesses;
CREATE POLICY "Business owners can manage their own businesses" ON public.businesses
FOR ALL USING (
  owner_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

DROP POLICY IF EXISTS "Users can create their own business" ON public.businesses;
DROP POLICY IF EXISTS "Users can create their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can delete their own business" ON public.businesses;
DROP POLICY IF EXISTS "Users can delete their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON public.businesses;
DROP POLICY IF EXISTS "Users can update their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can view their own businesses" ON public.businesses;

-- Events policies
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Authenticated users can create events" ON public.events
FOR INSERT WITH CHECK (
  current_setting('request.jwt.claims', true)::json->>'sub' IS NOT NULL
);

DROP POLICY IF EXISTS "Users can create their own events" ON public.events;
CREATE POLICY "Users can create their own events" ON public.events
FOR INSERT WITH CHECK (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
CREATE POLICY "Users can delete their own events" ON public.events
FOR DELETE USING (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
CREATE POLICY "Users can update their own events" ON public.events
FOR UPDATE USING (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
CREATE POLICY "Users can view their own events" ON public.events
FOR SELECT USING (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

-- Profiles policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

-- User roles policies - update to use optimized function
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (
  user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

-- Update admin-related policies to use optimized has_role function calls
-- Ad sizes policies
DROP POLICY IF EXISTS "Admins can manage ad sizes" ON public.ad_sizes;
CREATE POLICY "Admins can manage ad sizes" ON public.ad_sizes
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Component settings policies
DROP POLICY IF EXISTS "Only admins can manage component settings" ON public.component_settings;
CREATE POLICY "Only admins can manage component settings" ON public.component_settings
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Content blocks policies
DROP POLICY IF EXISTS "Only admins can manage content blocks" ON public.content_blocks;
CREATE POLICY "Only admins can manage content blocks" ON public.content_blocks
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Media library policies
DROP POLICY IF EXISTS "Only admins can manage media library" ON public.media_library;
CREATE POLICY "Only admins can manage media library" ON public.media_library
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Navigation menus policies
DROP POLICY IF EXISTS "Only admins can manage navigation menus" ON public.navigation_menus;
CREATE POLICY "Only admins can manage navigation menus" ON public.navigation_menus
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Pages policies
DROP POLICY IF EXISTS "Only admins can manage pages" ON public.pages;
CREATE POLICY "Only admins can manage pages" ON public.pages
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Pricing areas policies
DROP POLICY IF EXISTS "Admins can manage pricing areas" ON public.pricing_areas;
CREATE POLICY "Admins can manage pricing areas" ON public.pricing_areas
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Pricing durations policies
DROP POLICY IF EXISTS "Admins can manage pricing durations" ON public.pricing_durations;
CREATE POLICY "Admins can manage pricing durations" ON public.pricing_durations
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Site settings policies
DROP POLICY IF EXISTS "Only admins can manage site settings" ON public.site_settings;
CREATE POLICY "Only admins can manage site settings" ON public.site_settings
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Special deals policies
DROP POLICY IF EXISTS "Admins can manage special deals" ON public.special_deals;
CREATE POLICY "Admins can manage special deals" ON public.special_deals
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Stories policies
DROP POLICY IF EXISTS "Admins can manage all stories" ON public.stories;
CREATE POLICY "Admins can manage all stories" ON public.stories
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Theme settings policies
DROP POLICY IF EXISTS "Only admins can manage theme settings" ON public.theme_settings;
CREATE POLICY "Only admins can manage theme settings" ON public.theme_settings
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- User roles policies
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);

-- Volume discounts policies
DROP POLICY IF EXISTS "Admins can manage volume discounts" ON public.volume_discounts;
CREATE POLICY "Admins can manage volume discounts" ON public.volume_discounts
FOR ALL USING (
  has_role((current_setting('request.jwt.claims', true)::json->>'sub')::uuid, 'admin'::app_role)
);