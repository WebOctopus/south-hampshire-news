-- Create leaflet_campaign_durations table for managing campaign duration settings
CREATE TABLE public.leaflet_campaign_durations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  issues INTEGER NOT NULL,
  months INTEGER NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leaflet_campaign_durations ENABLE ROW LEVEL SECURITY;

-- Create policies for leaflet campaign durations
CREATE POLICY "Anyone can view active leaflet campaign durations" 
ON public.leaflet_campaign_durations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin full access to leaflet campaign durations" 
ON public.leaflet_campaign_durations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leaflet_campaign_durations_updated_at
BEFORE UPDATE ON public.leaflet_campaign_durations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default campaign duration settings
INSERT INTO public.leaflet_campaign_durations (name, issues, months, description, is_default, sort_order) VALUES
('Single Issue Campaign', 1, 2, 'One issue campaign lasting 2 months', true, 1),
('Standard Campaign', 3, 6, 'Three issue campaign lasting 6 months', false, 2);