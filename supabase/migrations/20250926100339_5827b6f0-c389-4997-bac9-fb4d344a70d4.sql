-- Create alerts table for managing deadline and premium slot alerts
CREATE TABLE public.alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('deadline', 'premium_slot')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    badge_text TEXT,
    badge_color TEXT DEFAULT 'red'
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for alerts
CREATE POLICY "Active alerts are viewable by everyone" 
ON public.alerts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin full access to alerts" 
ON public.alerts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.alerts (title, message, alert_type, badge_text, badge_color, priority) VALUES
('DEADLINE ALERT!', 'Next deadline: 14th May 2025\nDon''t miss out - secure your ad space now!', 'deadline', 'Urgent', 'red', 1),
('Back Cover Available', 'Back Cover available in Areas 1 & 10', 'premium_slot', 'Limited', 'orange', 2),
('Last Leaflet Slot', 'Last leaflet slot in Chandler''s Ford available', 'premium_slot', 'Last One', 'yellow', 3);