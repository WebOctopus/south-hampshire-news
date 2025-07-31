-- Create content management tables for the WordPress-like backend

-- Site settings table for global configuration
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL DEFAULT 'text',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Pages management table
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}',
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  template text DEFAULT 'default',
  sort_order integer DEFAULT 0,
  parent_id uuid REFERENCES public.pages(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Navigation menus table
CREATE TABLE public.navigation_menus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  menu_items jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Content blocks/widgets table
CREATE TABLE public.content_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  block_type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  position text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Media library table
CREATE TABLE public.media_library (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  alt_text text,
  caption text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Theme settings table
CREATE TABLE public.theme_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_group text NOT NULL,
  setting_key text NOT NULL,
  setting_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(setting_group, setting_key)
);

-- Component settings table for managing front-end components
CREATE TABLE public.component_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(component_name)
);

-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin-only access
CREATE POLICY "Only admins can manage site settings" ON public.site_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Only admins can manage pages" ON public.pages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Published pages are viewable by everyone" ON public.pages
FOR SELECT USING (is_published = true);

CREATE POLICY "Only admins can manage navigation menus" ON public.navigation_menus
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Active navigation menus are viewable by everyone" ON public.navigation_menus
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage content blocks" ON public.content_blocks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Active content blocks are viewable by everyone" ON public.content_blocks
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage media library" ON public.media_library
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Media library is viewable by everyone" ON public.media_library
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage theme settings" ON public.theme_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Theme settings are viewable by everyone" ON public.theme_settings
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage component settings" ON public.component_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Component settings are viewable by everyone" ON public.component_settings
FOR SELECT USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_navigation_menus_updated_at
BEFORE UPDATE ON public.navigation_menus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at
BEFORE UPDATE ON public.content_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_theme_settings_updated_at
BEFORE UPDATE ON public.theme_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_component_settings_updated_at
BEFORE UPDATE ON public.component_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_title', '"Community Connect"', 'text', 'Website title'),
('site_description', '"Local community news and business directory"', 'text', 'Website description'),
('contact_email', '"info@communityconnect.com"', 'email', 'Main contact email'),
('contact_phone', '"+1 (555) 123-4567"', 'phone', 'Main contact phone'),
('social_facebook', '""', 'url', 'Facebook page URL'),
('social_twitter', '""', 'url', 'Twitter profile URL'),
('social_instagram', '""', 'url', 'Instagram profile URL'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
('allow_registrations', 'true', 'boolean', 'Allow new user registrations'),
('max_upload_size', '10', 'number', 'Maximum file upload size in MB');

-- Insert default component settings
INSERT INTO public.component_settings (component_name, is_enabled, settings) VALUES
('hero_section', true, '{"show_video": true, "background_type": "video"}'),
('newsletter_signup', true, '{"position": "footer", "required_fields": ["email"]}'),
('testimonials_carousel', true, '{"autoplay": true, "interval": 5000}'),
('featured_advertisers', true, '{"max_items": 6, "shuffle": true}'),
('business_directory', true, '{"items_per_page": 12, "show_map": true}'),
('whats_on_section', true, '{"max_events": 8, "show_past_events": false}'),
('latest_stories', true, '{"max_stories": 6, "show_excerpts": true}'),
('cost_calculator', true, '{"show_advanced_options": true}');

-- Insert default navigation menu
INSERT INTO public.navigation_menus (name, location, menu_items) VALUES
('main_menu', 'header', '[
  {"label": "Home", "url": "/", "type": "internal"},
  {"label": "Business Directory", "url": "/business-directory", "type": "internal"},
  {"label": "What''s On", "url": "/whats-on", "type": "internal"},
  {"label": "Advertising", "url": "/advertising", "type": "internal"},
  {"label": "Stories", "url": "/stories", "type": "internal"},
  {"label": "Contact", "url": "/contact", "type": "internal"}
]');

-- Insert default content blocks
INSERT INTO public.content_blocks (name, block_type, content, position, sort_order) VALUES
('hero_banner', 'hero', '{
  "title": "Welcome to Community Connect",
  "subtitle": "Your local community hub for news, events, and businesses",
  "background_video": "/websitevideo/hero-video.mp4",
  "cta_text": "Explore Now",
  "cta_link": "/business-directory"
}', 'home_top', 1),
('footer_content', 'footer', '{
  "copyright": "© 2024 Community Connect. All rights reserved.",
  "links": [
    {"label": "Privacy Policy", "url": "/privacy"},
    {"label": "Terms of Service", "url": "/terms"},
    {"label": "Contact Us", "url": "/contact"}
  ]
}', 'global_footer', 1);