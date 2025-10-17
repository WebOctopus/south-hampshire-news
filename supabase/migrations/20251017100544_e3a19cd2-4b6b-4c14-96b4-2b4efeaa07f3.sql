-- Add GoCardless mandate ID to bookings table
ALTER TABLE public.bookings
ADD COLUMN gocardless_mandate_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending';

-- Create GoCardless customers table
CREATE TABLE public.gocardless_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  gocardless_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create GoCardless mandates table
CREATE TABLE public.gocardless_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  booking_id UUID REFERENCES public.bookings,
  gocardless_mandate_id TEXT NOT NULL UNIQUE,
  gocardless_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  scheme TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create GoCardless payments table
CREATE TABLE public.gocardless_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings NOT NULL,
  gocardless_payment_id TEXT NOT NULL UNIQUE,
  gocardless_mandate_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  status TEXT NOT NULL,
  charge_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create GoCardless subscriptions table
CREATE TABLE public.gocardless_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings NOT NULL,
  gocardless_subscription_id TEXT NOT NULL UNIQUE,
  gocardless_mandate_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  interval_unit TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.gocardless_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gocardless_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gocardless_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gocardless_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gocardless_customers
CREATE POLICY "Users can view their own GoCardless customer records"
ON public.gocardless_customers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own GoCardless customer records"
ON public.gocardless_customers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all GoCardless customer records"
ON public.gocardless_customers FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for gocardless_mandates
CREATE POLICY "Users can view their own mandates"
ON public.gocardless_mandates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mandates"
ON public.gocardless_mandates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mandates"
ON public.gocardless_mandates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mandates"
ON public.gocardless_mandates FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for gocardless_payments
CREATE POLICY "Users can view payments for their bookings"
ON public.gocardless_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = gocardless_payments.booking_id
    AND bookings.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all payments"
ON public.gocardless_payments FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for gocardless_subscriptions
CREATE POLICY "Users can view subscriptions for their bookings"
ON public.gocardless_subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = gocardless_subscriptions.booking_id
    AND bookings.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all subscriptions"
ON public.gocardless_subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_gocardless_customers_user_id ON public.gocardless_customers(user_id);
CREATE INDEX idx_gocardless_mandates_user_id ON public.gocardless_mandates(user_id);
CREATE INDEX idx_gocardless_mandates_booking_id ON public.gocardless_mandates(booking_id);
CREATE INDEX idx_gocardless_payments_booking_id ON public.gocardless_payments(booking_id);
CREATE INDEX idx_gocardless_subscriptions_booking_id ON public.gocardless_subscriptions(booking_id);

-- Add triggers for updated_at
CREATE TRIGGER update_gocardless_customers_updated_at
BEFORE UPDATE ON public.gocardless_customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gocardless_mandates_updated_at
BEFORE UPDATE ON public.gocardless_mandates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gocardless_payments_updated_at
BEFORE UPDATE ON public.gocardless_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gocardless_subscriptions_updated_at
BEFORE UPDATE ON public.gocardless_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();