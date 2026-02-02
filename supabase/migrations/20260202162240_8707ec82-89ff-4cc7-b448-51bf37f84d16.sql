-- Add date_end column to events table for multi-day event support
ALTER TABLE public.events 
ADD COLUMN date_end date NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.events.date_end IS 'Optional end date for multi-day events. If NULL or same as date, treated as single-day event.';