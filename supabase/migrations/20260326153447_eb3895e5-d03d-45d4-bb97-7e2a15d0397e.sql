
-- Create booking_artwork table
CREATE TABLE public.booking_artwork (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  notes text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz
);

ALTER TABLE public.booking_artwork ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own artwork" ON public.booking_artwork
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can upload artwork" ON public.booking_artwork
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access artwork" ON public.booking_artwork
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for artwork
INSERT INTO storage.buckets (id, name, public) VALUES ('booking-artwork', 'booking-artwork', true);

-- Storage RLS policies
CREATE POLICY "Users can upload artwork files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'booking-artwork' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own artwork files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'booking-artwork' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admin full access artwork files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'booking-artwork' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'booking-artwork' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view artwork files" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'booking-artwork');
