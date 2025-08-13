-- Add optional user_id to quote_requests for authenticated users
ALTER TABLE public.quote_requests 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add policy for authenticated users to view their own quote requests
CREATE POLICY "Users can view their own quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (user_id = auth.uid());

-- Add policy for authenticated users to update their own quote requests
CREATE POLICY "Users can update their own quote requests" 
ON public.quote_requests 
FOR UPDATE 
USING (user_id = auth.uid());

-- Update the insert policy to allow setting user_id when authenticated
DROP POLICY IF EXISTS "Anyone can create quote requests" ON public.quote_requests;

CREATE POLICY "Anyone can create quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);