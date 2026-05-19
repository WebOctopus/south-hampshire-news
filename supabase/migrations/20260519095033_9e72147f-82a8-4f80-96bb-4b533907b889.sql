
-- Email send audit log
CREATE TABLE public.email_send_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NULL,
  quote_id UUID NULL,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('customer', 'admin')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  provider_message_id TEXT NULL,
  error_message TEXT NULL,
  metadata JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_send_log_booking_id ON public.email_send_log(booking_id);
CREATE INDEX idx_email_send_log_quote_id ON public.email_send_log(quote_id);
CREATE INDEX idx_email_send_log_recipient_email ON public.email_send_log(recipient_email);
CREATE INDEX idx_email_send_log_created_at ON public.email_send_log(created_at DESC);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all rows; writes happen via service role from edge functions only
CREATE POLICY "Admins can view all email send logs"
ON public.email_send_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
