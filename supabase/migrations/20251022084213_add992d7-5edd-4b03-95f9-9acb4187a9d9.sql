-- Create storage bucket for ad preview images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-preview-images', 'ad-preview-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create ad_preview_images table
CREATE TABLE IF NOT EXISTS public.ad_preview_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_size_id UUID NOT NULL REFERENCES public.ad_sizes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ad_preview_images
ALTER TABLE public.ad_preview_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ad_preview_images
CREATE POLICY "Active preview images viewable by everyone"
  ON public.ad_preview_images
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full access to preview images"
  ON public.ad_preview_images
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_ad_preview_images_updated_at
  BEFORE UPDATE ON public.ad_preview_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage RLS Policies for ad-preview-images bucket
CREATE POLICY "Anyone can view ad preview images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'ad-preview-images');

CREATE POLICY "Admins can upload ad preview images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'ad-preview-images' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update ad preview images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'ad-preview-images' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete ad preview images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'ad-preview-images' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );