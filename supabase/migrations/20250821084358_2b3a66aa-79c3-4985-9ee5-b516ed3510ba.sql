-- Create leaflet_areas table
CREATE TABLE public.leaflet_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  postcodes TEXT NOT NULL,
  bimonthly_circulation INTEGER NOT NULL DEFAULT 0,
  price_with_vat NUMERIC NOT NULL DEFAULT 0,
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaflet_sizes table
CREATE TABLE public.leaflet_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaflet_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaflet_sizes ENABLE ROW LEVEL SECURITY;

-- Create policies for leaflet_areas
CREATE POLICY "Anyone can view active leaflet areas" 
ON public.leaflet_areas 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin full access to leaflet areas" 
ON public.leaflet_areas 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for leaflet_sizes
CREATE POLICY "Anyone can view active leaflet sizes" 
ON public.leaflet_sizes 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin full access to leaflet sizes" 
ON public.leaflet_sizes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updating updated_at
CREATE TRIGGER update_leaflet_areas_updated_at
BEFORE UPDATE ON public.leaflet_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaflet_sizes_updated_at
BEFORE UPDATE ON public.leaflet_sizes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();