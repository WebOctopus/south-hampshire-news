-- Create tables for dynamic pricing management

-- Areas table for geographical pricing
CREATE TABLE public.pricing_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  postcodes TEXT[] NOT NULL DEFAULT '{}',
  circulation INTEGER NOT NULL DEFAULT 0,
  base_price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  quarter_page_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  half_page_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  full_page_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ad sizes table for advertisement dimensions and pricing
CREATE TABLE public.ad_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  base_price_per_month DECIMAL(8,2) NOT NULL DEFAULT 0,
  base_price_per_area DECIMAL(8,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Duration options table for campaign lengths
CREATE TABLE public.pricing_durations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration_type TEXT NOT NULL CHECK (duration_type IN ('fixed', 'subscription')),
  duration_value INTEGER NOT NULL, -- number of issues or months
  discount_percentage DECIMAL(4,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Volume discounts table for bulk pricing
CREATE TABLE public.volume_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_areas INTEGER NOT NULL,
  max_areas INTEGER,
  discount_percentage DECIMAL(4,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Special deals and promotions table
CREATE TABLE public.special_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  deal_type TEXT NOT NULL CHECK (deal_type IN ('bogof', 'percentage_discount', 'fixed_discount')),
  deal_value DECIMAL(8,2) NOT NULL DEFAULT 0, -- percentage or fixed amount
  min_areas INTEGER DEFAULT 1,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pricing_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_durations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volume_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access, admin write access
CREATE POLICY "Anyone can view pricing areas" ON public.pricing_areas
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing areas" ON public.pricing_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Anyone can view ad sizes" ON public.ad_sizes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage ad sizes" ON public.ad_sizes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Anyone can view pricing durations" ON public.pricing_durations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing durations" ON public.pricing_durations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Anyone can view volume discounts" ON public.volume_discounts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage volume discounts" ON public.volume_discounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Anyone can view special deals" ON public.special_deals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage special deals" ON public.special_deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_pricing_areas_updated_at
  BEFORE UPDATE ON public.pricing_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_sizes_updated_at
  BEFORE UPDATE ON public.ad_sizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_durations_updated_at
  BEFORE UPDATE ON public.pricing_durations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_volume_discounts_updated_at
  BEFORE UPDATE ON public.volume_discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_deals_updated_at
  BEFORE UPDATE ON public.special_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data from existing pricing structure
INSERT INTO public.pricing_areas (name, postcodes, circulation, base_price_multiplier, quarter_page_multiplier, half_page_multiplier, full_page_multiplier, sort_order) VALUES
('Abingdon', ARRAY['OX14'], 25000, 1.0, 1.0, 1.0, 1.0, 1),
('Banbury', ARRAY['OX15', 'OX16', 'OX17'], 42000, 1.0, 1.0, 1.0, 1.0, 2),
('Bicester', ARRAY['OX25', 'OX26', 'OX27'], 35000, 1.0, 1.0, 1.0, 1.0, 3),
('Didcot', ARRAY['OX11'], 28000, 1.0, 1.0, 1.0, 1.0, 4),
('Faringdon', ARRAY['SN7'], 18000, 1.0, 1.0, 1.0, 1.0, 5),
('Henley-on-Thames', ARRAY['RG9'], 22000, 1.0, 1.0, 1.0, 1.0, 6),
('Kidlington', ARRAY['OX5'], 32000, 1.0, 1.0, 1.0, 1.0, 7),
('Oxford', ARRAY['OX1', 'OX2', 'OX3', 'OX4'], 65000, 1.0, 1.0, 1.0, 1.0, 8),
('Thame', ARRAY['OX9'], 20000, 1.0, 1.0, 1.0, 1.0, 9),
('Wallingford', ARRAY['OX10'], 15000, 1.0, 1.0, 1.0, 1.0, 10),
('Wantage', ARRAY['OX12'], 24000, 1.0, 1.0, 1.0, 1.0, 11),
('Witney', ARRAY['OX28', 'OX29'], 38000, 1.0, 1.0, 1.0, 1.0, 12),
('Woodstock', ARRAY['OX20'], 16000, 1.0, 1.0, 1.0, 1.0, 13);

INSERT INTO public.ad_sizes (name, dimensions, base_price_per_month, base_price_per_area, sort_order) VALUES
('Quarter Page', '90mm x 132mm', 120.00, 120.00, 1),
('Half Page', '186mm x 132mm', 180.00, 180.00, 2),
('Full Page', '186mm x 268mm', 240.00, 240.00, 3);

INSERT INTO public.pricing_durations (name, duration_type, duration_value, discount_percentage, sort_order) VALUES
('1 Issue', 'fixed', 1, 0.00, 1),
('2 Issues', 'fixed', 2, 10.00, 2),
('3 Issues', 'fixed', 3, 15.00, 3),
('6 Months', 'subscription', 6, 20.00, 4),
('12 Months', 'subscription', 12, 25.00, 5);

INSERT INTO public.volume_discounts (min_areas, max_areas, discount_percentage) VALUES
(1, 2, 0.00),
(3, 5, 5.00),
(6, 8, 10.00),
(9, NULL, 15.00);

INSERT INTO public.special_deals (name, description, deal_type, deal_value, min_areas, is_active) VALUES
('BOGOF Special', 'Buy one area, get one free - minimum 2 areas required', 'bogof', 50.00, 2, true);