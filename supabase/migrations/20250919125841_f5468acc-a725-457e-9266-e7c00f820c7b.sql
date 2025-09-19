-- Create payment_options table
CREATE TABLE public.payment_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  minimum_payments INTEGER,
  additional_fee_percentage NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active payment options" 
ON public.payment_options 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin full access to payment options" 
ON public.payment_options 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for timestamps
CREATE TRIGGER update_payment_options_updated_at
BEFORE UPDATE ON public.payment_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment options
INSERT INTO public.payment_options (option_type, display_name, description, discount_percentage, minimum_payments, additional_fee_percentage, sort_order) VALUES
('6_months_full', '6 Months Full Payment', 'Pay upfront for 6 months', 0, NULL, 0, 1),
('12_months_full', '12 Months Full Payment', 'Pay upfront for 12 months and save 10%', 10, NULL, 0, 2),
('monthly', 'Monthly Direct Debit', 'Pay monthly with 2% direct debit discount', 0, 6, -2, 3);