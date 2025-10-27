-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  payment_type TEXT NOT NULL,
  gocardless_payment_id TEXT,
  gocardless_subscription_id TEXT,
  gocardless_mandate_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = invoices.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Admins can manage all invoices
CREATE POLICY "Admins can manage all invoices"
  ON public.invoices FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_invoices_booking_id ON public.invoices(booking_id);
CREATE INDEX idx_invoices_gocardless_payment_id ON public.invoices(gocardless_payment_id);
CREATE INDEX idx_invoices_gocardless_subscription_id ON public.invoices(gocardless_subscription_id);

-- Add invoice tracking to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS invoice_generated BOOLEAN DEFAULT FALSE;

-- Add trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create invoices storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for invoices bucket - users can only access their own booking invoices
CREATE POLICY "Users can view their own invoice files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices' AND
    auth.uid() IN (
      SELECT b.user_id 
      FROM public.bookings b
      WHERE b.id::text = (string_to_array(name, '/'))[2]
    )
  );

-- Admins can manage all invoice files
CREATE POLICY "Admins can manage all invoice files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'::app_role));

-- Function to generate sequential invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  year_part TEXT;
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get the next number for this year
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number LIKE 'INV-' || year_part || '-%' 
      THEN (SPLIT_PART(invoice_number, '-', 3))::INTEGER 
      ELSE 0 
    END
  ), 0) + 1 INTO next_num
  FROM public.invoices;
  
  -- Format as INV-YYYY-NNNNN (5 digits padded with zeros)
  invoice_num := 'INV-' || year_part || '-' || LPAD(next_num::TEXT, 5, '0');
  
  RETURN invoice_num;
END;
$$;