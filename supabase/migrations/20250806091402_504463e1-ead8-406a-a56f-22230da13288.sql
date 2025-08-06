-- Fix Auth RLS Initialization Plan warnings by using optimized auth.uid() approach
-- The current_setting() approach actually causes performance issues due to JSON parsing

-- Business categories policies
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.business_categories;
CREATE POLICY "Authenticated users can manage categories" ON public.business_categories
FOR ALL USING (auth.uid() IS NOT NULL);

-- Business reviews policies  
DROP POLICY IF EXISTS "Users can create reviews" ON public.business_reviews;
CREATE POLICY "Users can create reviews" ON public.business_reviews
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.business_reviews;
CREATE POLICY "Users can update their own reviews" ON public.business_reviews
FOR UPDATE USING (user_id = auth.uid());

-- Businesses policies
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON public.businesses;
CREATE POLICY "Authenticated users can create businesses" ON public.businesses
FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Business owners can manage their own businesses" ON public.businesses;
CREATE POLICY "Business owners can manage their own businesses" ON public.businesses
FOR ALL USING (owner_id = auth.uid());

-- Events policies
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Authenticated users can create events" ON public.events
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create their own events" ON public.events;
CREATE POLICY "Users can create their own events" ON public.events
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
CREATE POLICY "Users can delete their own events" ON public.events
FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
CREATE POLICY "Users can update their own events" ON public.events
FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
CREATE POLICY "Users can view their own events" ON public.events
FOR SELECT USING (user_id = auth.uid());

-- Profiles policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Admin-related policies using optimized has_role function
DROP POLICY IF EXISTS "Admins can manage ad sizes" ON public.ad_sizes;
CREATE POLICY "Admins can manage ad sizes" ON public.ad_sizes
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can manage component settings" ON public.component_settings;
CREATE POLICY "Only admins can manage component settings" ON public.component_settings
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can manage content blocks" ON public.content_blocks;
CREATE POLICY "Only admins can manage content blocks" ON public.content_blocks
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can manage media library" ON public.media_library;
CREATE POLICY "Only admins can manage media library" ON public.media_library
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can manage navigation menus" ON public.navigation_menus;
CREATE POLICY "Only admins can manage navigation menus" ON public.navigation_menus
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can manage pages" ON public.pages;
CREATE POLICY "Only admins can manage pages" ON public.pages
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage pricing areas" ON public.pricing_areas;
CREATE POLICY "Admins can manage pricing areas" ON public.pricing_areas
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage pricing durations" ON public.pricing_durations;
CREATE POLICY "Admins can manage pricing durations" ON public.pricing_durations
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can manage site settings" ON public.site_settings;
CREATE POLICY "Only admins can manage site settings" ON public.site_settings
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage special deals" ON public.special_deals;
CREATE POLICY "Admins can manage special deals" ON public.special_deals
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage all stories" ON public.stories;
CREATE POLICY "Admins can manage all stories" ON public.stories
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can manage theme settings" ON public.theme_settings;
CREATE POLICY "Only admins can manage theme settings" ON public.theme_settings
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage volume discounts" ON public.volume_discounts;
CREATE POLICY "Admins can manage volume discounts" ON public.volume_discounts
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));