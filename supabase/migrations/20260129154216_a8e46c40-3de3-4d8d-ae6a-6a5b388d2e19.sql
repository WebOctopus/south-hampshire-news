-- Create featured_advertisers table
CREATE TABLE public.featured_advertisers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_advertisers ENABLE ROW LEVEL SECURITY;

-- Public can view active advertisers
CREATE POLICY "Anyone can view active featured advertisers"
ON public.featured_advertisers
FOR SELECT
USING (is_active = true);

-- Admins have full access
CREATE POLICY "Admins can manage featured advertisers"
ON public.featured_advertisers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_featured_advertisers_updated_at
BEFORE UPDATE ON public.featured_advertisers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data from the current hardcoded advertisers
INSERT INTO public.featured_advertisers (name, image_url, sort_order) VALUES
('DJ Summers Plumbing & Heating', '/lovable-uploads/3457943e-ae98-43c0-b6cb-556d1d936472.png', 1),
('Edwards Conservatory & Gutter Cleaning', '/lovable-uploads/f6d05495-f433-4146-a6c5-b4332e7616bf.png', 2),
('Acorn Tree Specialist Ltd', '/lovable-uploads/0fd435d2-73a9-43e4-94cb-ee201a129979.png', 3),
('The Little Curtain and Blind Company', '/lovable-uploads/9940534b-25e0-4a76-9769-8f048532d0a5.png', 4),
('Jon Callen Podiatrist', '/lovable-uploads/6ce5a96b-19dd-49ab-aa34-4a048c3c22d2.png', 5),
('Mark Parsons Decorating Services', '/lovable-uploads/5c775c6a-2d81-439b-871e-56243f2f1686.png', 6),
('Martin Langley Carpentry', '/lovable-uploads/5d7d823c-c298-48e4-81ca-f206cfb9e6f9.png', 7),
('W.A.G Decorating Services', '/lovable-uploads/3bf54723-bde1-45e5-ba7d-fa1c6a9a1a1a.png', 8);