-- Add user_id to events table to associate events with users
ALTER TABLE public.events 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable Row Level Security on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for user access to events
CREATE POLICY "Users can view their own events" 
ON public.events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policy for public viewing of events (for the public events pages)
CREATE POLICY "Events are publicly viewable" 
ON public.events 
FOR SELECT 
USING (true);