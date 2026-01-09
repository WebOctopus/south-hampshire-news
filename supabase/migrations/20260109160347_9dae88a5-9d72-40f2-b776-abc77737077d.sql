-- Add postcode column to competition_entries table
ALTER TABLE public.competition_entries 
ADD COLUMN postcode text NOT NULL DEFAULT '';