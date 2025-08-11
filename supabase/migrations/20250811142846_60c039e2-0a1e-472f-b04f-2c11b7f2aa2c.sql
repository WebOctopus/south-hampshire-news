-- Create a table for quote requests that go to admin
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  title TEXT,
  pricing_model TEXT NOT NULL,
  ad_size_id UUID REFERENCES ad_sizes(id),
  duration_id UUID REFERENCES pricing_durations(id),
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
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for quote requests
CREATE POLICY "Admins can view all quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update quote requests" 
ON public.quote_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();