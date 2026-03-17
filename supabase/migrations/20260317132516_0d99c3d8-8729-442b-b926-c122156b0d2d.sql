ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS terms_viewed_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS terms_viewed_at timestamptz;