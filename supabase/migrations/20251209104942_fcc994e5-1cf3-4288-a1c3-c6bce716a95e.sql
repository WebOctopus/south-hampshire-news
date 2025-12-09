-- Create magazine_editions table
CREATE TABLE public.magazine_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.magazine_editions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active editions
CREATE POLICY "Anyone can view active editions"
  ON public.magazine_editions FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can manage editions
CREATE POLICY "Admins can manage editions"
  ON public.magazine_editions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_magazine_editions_updated_at
  BEFORE UPDATE ON public.magazine_editions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with current editions
INSERT INTO public.magazine_editions (title, image_url, alt_text, sort_order) VALUES
  ('WINCHESTER & SURROUNDS', '/lovable-uploads/0ee7cdb0-f6e6-4dd5-9492-8136e247b6ab.png', 'Discover Magazine - Winchester & Surrounds Edition', 1),
  ('ITCHEN VALLEY', '/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png', 'Discover Magazine - Itchen Valley Edition', 2),
  ('MEON VALLEY & WHITELEY', '/lovable-uploads/c4490b9b-94ad-42c9-a7d4-80ba8a52d3eb.png', 'Discover Magazine - Meon Valley & Whiteley Edition', 3),
  ('NEW FOREST & WATERSIDE', '/lovable-uploads/d554421b-d268-40db-8d87-a66cd858a71a.png', 'Discover Magazine - New Forest & Waterside Edition', 4),
  ('SOUTHAMPTON WEST & TOTTON', '/lovable-uploads/92f70bb1-98a7-464d-a511-5eb7eef51998.png', 'Discover Magazine - Southampton West & Totton Edition', 5),
  ('TEST VALLEY & ROMSEY', '/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png', 'Discover Magazine - Test Valley & Romsey Edition', 6),
  ('WINCHESTER & ALRESFORD', '/lovable-uploads/f98d0aa9-985f-4d69-85b9-193bf1934a18.png', 'Discover Magazine - Winchester & Alresford Edition', 7),
  ('CHANDLER''S FORD & EASTLEIGH', '/lovable-uploads/d4b20a63-65ea-4dec-b4b7-f1e1a6748979.png', 'Discover Magazine - Chandler''s Ford & Eastleigh Edition', 8);