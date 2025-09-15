-- Create vouchers table for special offers
CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  voucher_code TEXT NOT NULL UNIQUE,
  voucher_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed_amount'
  discount_value NUMERIC NOT NULL DEFAULT 0, -- 10 for 10% or fixed amount
  service_type TEXT NOT NULL DEFAULT 'leafleting', -- which service this applies to
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_from_booking_id UUID, -- reference to booking that generated this voucher
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT
);

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Create policies for vouchers
CREATE POLICY "Users can view their own vouchers" 
ON public.vouchers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vouchers" 
ON public.vouchers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to vouchers" 
ON public.vouchers FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_vouchers_updated_at
BEFORE UPDATE ON public.vouchers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique voucher codes
CREATE OR REPLACE FUNCTION public.generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character alphanumeric code
        code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.vouchers WHERE voucher_code = code) INTO code_exists;
        
        -- Exit loop if code is unique
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;