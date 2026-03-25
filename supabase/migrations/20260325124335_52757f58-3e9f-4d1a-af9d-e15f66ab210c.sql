ALTER TABLE public.gocardless_mandates
  DROP CONSTRAINT gocardless_mandates_user_id_fkey,
  ADD CONSTRAINT gocardless_mandates_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;