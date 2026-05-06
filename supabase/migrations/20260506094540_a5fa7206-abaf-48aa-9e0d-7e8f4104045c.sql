DROP POLICY IF EXISTS "Anyone can create competition entries" ON public.competition_entries;

CREATE POLICY "Anyone can create competition entries"
  ON public.competition_entries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);