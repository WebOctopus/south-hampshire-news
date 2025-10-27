-- Add is_first_login field to profiles table to track first-time vs returning users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_first_login boolean DEFAULT true;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_first_login ON public.profiles(user_id, is_first_login);