
-- Create event_categories table
CREATE TABLE public.event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active event categories"
  ON public.event_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage event categories"
  ON public.event_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create event_types table
CREATE TABLE public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active event types"
  ON public.event_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage event types"
  ON public.event_types FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed categories
INSERT INTO public.event_categories (name, sort_order) VALUES
  ('Community', 0), ('Music', 1), ('Arts & Culture', 2), ('Sports', 3),
  ('Food & Drink', 4), ('Family', 5), ('Business', 6), ('Education', 7),
  ('Health & Wellness', 8), ('Charity', 9), ('Other', 10);

-- Seed types
INSERT INTO public.event_types (name, sort_order) VALUES
  ('Festival', 0), ('Workshop', 1), ('Concert', 2), ('Exhibition', 3),
  ('Market', 4), ('Performance', 5), ('Talk/Lecture', 6), ('Networking', 7),
  ('Sports Event', 8), ('Fair', 9), ('Party', 10), ('Class', 11), ('Other', 12);
