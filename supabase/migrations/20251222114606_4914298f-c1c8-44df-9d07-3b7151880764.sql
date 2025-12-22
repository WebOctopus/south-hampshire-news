-- Add new columns to events table for complete event management
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS end_time time without time zone,
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS full_description text,
ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ticket_url text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Create index for published events
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);

-- Update RLS policies for admin management
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" 
ON public.events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update public view policy to only show published events
DROP POLICY IF EXISTS "Public events are viewable" ON public.events;
CREATE POLICY "Published events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (is_published = true);

-- Create event-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for event images
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Admins can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-images' AND has_role(auth.uid(), 'admin'::app_role));