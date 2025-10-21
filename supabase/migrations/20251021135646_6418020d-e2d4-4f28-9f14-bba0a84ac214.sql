-- Create product_packages table for managing pricing option displays
CREATE TABLE public.product_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Target',
  badge_text text,
  badge_variant text DEFAULT 'default',
  cta_text text NOT NULL DEFAULT 'SELECT',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_packages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active packages
CREATE POLICY "Anyone can view active product packages"
ON public.product_packages
FOR SELECT
USING (is_active = true);

-- Policy: Admin full access
CREATE POLICY "Admin full access to product packages"
ON public.product_packages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add update trigger
CREATE TRIGGER update_product_packages_updated_at
BEFORE UPDATE ON public.product_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing three packages
INSERT INTO public.product_packages (package_id, title, subtitle, description, icon, badge_text, badge_variant, cta_text, is_popular, sort_order, features) VALUES
(
  'fixed',
  'Fixed Term',
  'Predictable reach at a fixed term',
  'Perfect for time-sensitive campaigns and seasonal promotions',
  'Target',
  NULL,
  'default',
  'SELECT',
  false,
  1,
  '[
    {"label": "Number of Inserts", "value": "1, 2 or 3", "highlight": false},
    {"label": "Ad Hoc Option", "value": true, "highlight": false},
    {"label": "Save up to 30% vs one-offs", "value": true, "highlight": true},
    {"label": "Cancel anytime", "value": false, "highlight": false},
    {"label": "Leafleting Service", "value": false, "highlight": false}
  ]'::jsonb
),
(
  'bogof',
  '3+ Repeat Package',
  'Maximum reach with repeat bookings',
  'Maximize your exposure with our most popular repeat package',
  'Star',
  'Star Buy',
  'default',
  'SELECT',
  true,
  2,
  '[
    {"label": "Number of Inserts", "value": "3 or more", "highlight": false},
    {"label": "Subscription Option", "value": true, "highlight": false},
    {"label": "Save up to 30% vs one-offs", "value": true, "highlight": true},
    {"label": "2 for 1 Areas", "value": true, "highlight": true},
    {"label": "Cancel anytime", "value": true, "highlight": false},
    {"label": "Leafleting Service", "value": false, "highlight": false}
  ]'::jsonb
),
(
  'leafleting',
  'Leafleting Service',
  'Guaranteed door-to-door delivery',
  'Direct to households with GPS-tracked delivery confirmation',
  'MapPin',
  NULL,
  'default',
  'SELECT',
  false,
  3,
  '[
    {"label": "Door-to-door delivery", "value": true, "highlight": false},
    {"label": "GPS tracking", "value": true, "highlight": true},
    {"label": "Flexible scheduling", "value": true, "highlight": false},
    {"label": "Professional distribution", "value": true, "highlight": false},
    {"label": "Delivery confirmation", "value": true, "highlight": true}
  ]'::jsonb
);