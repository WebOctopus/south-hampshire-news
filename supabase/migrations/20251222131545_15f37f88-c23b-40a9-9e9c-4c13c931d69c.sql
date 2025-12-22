-- Add featured column to stories table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'featured') THEN
        ALTER TABLE public.stories ADD COLUMN featured boolean DEFAULT false;
    END IF;
END $$;

-- Create story-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload story images (admin managed primarily)
CREATE POLICY "Admins can upload story images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'story-images' AND (SELECT public.has_role(auth.uid(), 'admin'::public.app_role)));

-- Allow admins to update story images
CREATE POLICY "Admins can update story images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'story-images' AND (SELECT public.has_role(auth.uid(), 'admin'::public.app_role)));

-- Allow admins to delete story images
CREATE POLICY "Admins can delete story images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'story-images' AND (SELECT public.has_role(auth.uid(), 'admin'::public.app_role)));

-- Allow public read access to story images
CREATE POLICY "Anyone can view story images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'story-images');