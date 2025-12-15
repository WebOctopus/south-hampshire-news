-- Add issue_month column to magazine_editions table
ALTER TABLE public.magazine_editions 
ADD COLUMN issue_month text;