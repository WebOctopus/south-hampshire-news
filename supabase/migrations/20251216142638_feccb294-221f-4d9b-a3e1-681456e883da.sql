-- Add biz_type column to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS biz_type text;