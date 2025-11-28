-- Add status column to quotes table
ALTER TABLE public.quotes
ADD COLUMN status TEXT DEFAULT 'draft';

-- Add comment to explain the column
COMMENT ON COLUMN public.quotes.status IS 'Quote status: draft, bogof_return_interest, or other custom statuses';

-- Create index for better query performance on status filtering
CREATE INDEX idx_quotes_status ON public.quotes(status);