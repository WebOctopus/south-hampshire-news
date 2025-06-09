-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  postcode TEXT,
  organizer TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (events are public)
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

-- Only authenticated users can insert events (for add event form)
CREATE POLICY "Authenticated users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.events (title, description, date, time, location, area, postcode, organizer, category, type, image) VALUES
('Fareham Food Festival', 'A celebration of local food and drink with over 50 stalls featuring the best of Hampshire cuisine.', '2024-07-15', '10:00', 'Fareham Town Centre', 'Fareham', 'PO16', 'Fareham Council', 'Food & Drink', 'Festival', '/lovable-uploads/39aad051-fc81-4d48-8360-29e479c12edb.png'),
('Hamlet at New Theatre Royal', 'Shakespeare''s greatest tragedy performed by the Royal Shakespeare Company.', '2024-07-18', '19:30', 'New Theatre Royal Portsmouth', 'Portsmouth', 'PO1', 'New Theatre Royal', 'Theatre & Shows', 'Theatre', '/lovable-uploads/0cb5406a-eaee-4828-af68-e345305abd9e.png'),
('Community Garden Workshop', 'Learn sustainable gardening techniques and help maintain our community garden.', '2024-07-20', '14:00', 'Southsea Common', 'Southsea', 'PO5', 'Southsea Green Group', 'Community Activities', 'Workshop', '/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png'),
('Portsmouth Symphony Orchestra', 'Classical music evening featuring works by Mozart and Beethoven.', '2024-07-22', '20:00', 'Portsmouth Guildhall', 'Portsmouth', 'PO1', 'Portsmouth Guildhall', 'Music & Concerts', 'Concert', '/lovable-uploads/3457943e-ae98-43c0-b6cb-556d1d936472.png'),
('Local Artists Exhibition', 'Showcase of contemporary art from local Hampshire artists.', '2024-07-25', '11:00', 'Aspex Gallery Portsmouth', 'Portsmouth', 'PO1', 'Aspex Gallery', 'Arts & Culture', 'Exhibition', '/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png'),
('Comedy Night at The Wedgewood Rooms', 'Stand-up comedy featuring touring comedians and local talent.', '2024-07-27', '20:00', 'The Wedgewood Rooms', 'Portsmouth', 'PO1', 'The Wedgewood Rooms', 'Theatre & Shows', 'Comedy', '/lovable-uploads/3bf54723-bde1-45e5-ba7d-fa1c6a9a1a1a.png'),
('Charity Fun Run', '5K charity run to raise funds for local children''s hospice.', '2024-07-28', '09:00', 'Gosport Millennium Bridge', 'Gosport', 'PO12', 'Gosport Runners Club', 'Community Activities', 'Sports', '/lovable-uploads/5c775c6a-2d81-439b-871e-56243f2f1686.png'),
('Summer Film Festival', 'Week-long festival featuring independent and classic films.', '2024-08-02', '19:00', 'Showcase Cinema Portsmouth', 'Portsmouth', 'PO6', 'Portsmouth Film Society', 'Theatre & Shows', 'Film', '/lovable-uploads/5d7d823c-c298-48e4-81ca-f206cfb9e6f9.png');