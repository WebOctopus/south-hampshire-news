-- Create competitions table
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prize TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create competition entries table
CREATE TABLE public.competition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  agreed_to_terms BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;

-- Competitions RLS policies
CREATE POLICY "Anyone can view active competitions"
ON public.competitions
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all competitions"
ON public.competitions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Competition entries RLS policies
CREATE POLICY "Anyone can create competition entries"
ON public.competition_entries
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all competition entries"
ON public.competition_entries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all competition entries"
ON public.competition_entries
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_competitions_updated_at
BEFORE UPDATE ON public.competitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment entry count
CREATE OR REPLACE FUNCTION public.increment_competition_entry_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.competitions
  SET entry_count = entry_count + 1
  WHERE id = NEW.competition_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-increment entry count
CREATE TRIGGER increment_entry_count_trigger
AFTER INSERT ON public.competition_entries
FOR EACH ROW
EXECUTE FUNCTION public.increment_competition_entry_count();