-- Create competition_categories table
CREATE TABLE public.competition_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color_class TEXT DEFAULT 'bg-gray-100 text-gray-800',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default categories
INSERT INTO public.competition_categories (name, label, color_class) VALUES
  ('Travel', 'Travel', 'bg-blue-100 text-blue-800'),
  ('Food', 'Food & Dining', 'bg-orange-100 text-orange-800'),
  ('Family', 'Family', 'bg-purple-100 text-purple-800'),
  ('Shopping', 'Shopping', 'bg-pink-100 text-pink-800'),
  ('Entertainment', 'Entertainment', 'bg-green-100 text-green-800'),
  ('Beauty', 'Beauty & Wellness', 'bg-rose-100 text-rose-800'),
  ('Other', 'Other', 'bg-gray-100 text-gray-800');

-- Enable RLS
ALTER TABLE public.competition_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories
CREATE POLICY "Anyone can view competition categories"
  ON public.competition_categories FOR SELECT
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can insert competition categories"
  ON public.competition_categories FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update competition categories"
  ON public.competition_categories FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete competition categories"
  ON public.competition_categories FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_competition_categories_updated_at
  BEFORE UPDATE ON public.competition_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();