-- Add content_type column to distinguish between front covers and online content
ALTER TABLE public.magazine_editions
ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'front_cover';

-- Add a check constraint to ensure valid values
ALTER TABLE public.magazine_editions
ADD CONSTRAINT magazine_editions_content_type_check 
CHECK (content_type IN ('front_cover', 'online_content'));