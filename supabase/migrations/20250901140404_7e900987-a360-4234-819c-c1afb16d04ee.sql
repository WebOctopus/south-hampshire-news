-- Create bookings table for advertising campaigns
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  pricing_model TEXT NOT NULL,
  title TEXT,
  ad_size_id UUID,
  duration_id UUID,
  selected_area_ids UUID[] DEFAULT '{}',
  bogof_paid_area_ids UUID[] DEFAULT '{}',
  bogof_free_area_ids UUID[] DEFAULT '{}',
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC,
  final_total NUMERIC,
  duration_multiplier INTEGER,
  total_circulation INTEGER,
  volume_discount_percent NUMERIC,
  duration_discount_percent NUMERIC,
  pricing_breakdown JSONB NOT NULL DEFAULT '{}',
  selections JSONB NOT NULL DEFAULT '{}',
  webhook_payload JSONB NOT NULL DEFAULT '{}',
  webhook_sent_at TIMESTAMP WITH TIME ZONE,
  webhook_response JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" 
ON public.bookings 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to bookings" 
ON public.bookings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();