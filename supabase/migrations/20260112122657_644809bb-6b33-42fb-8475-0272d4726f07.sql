-- Add phone number field for story contact details
ALTER TABLE public.stories
ADD COLUMN author_phone text;