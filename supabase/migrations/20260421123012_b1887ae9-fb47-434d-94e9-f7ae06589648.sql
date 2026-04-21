-- Drop the public insert path so all anonymous submissions go through the validated edge function
DROP POLICY IF EXISTS "Anyone can submit events for approval" ON public.events;

-- Lightweight submission log for rate limiting & abuse review
CREATE TABLE public.event_submission_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  user_agent text,
  blocked_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_submission_log_ip_created
  ON public.event_submission_log (ip_hash, created_at DESC);

ALTER TABLE public.event_submission_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view submission log"
  ON public.event_submission_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));