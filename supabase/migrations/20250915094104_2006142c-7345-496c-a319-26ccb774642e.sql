-- Add missing INSERT policy for vouchers table
CREATE POLICY "Users can create their own vouchers" 
ON public.vouchers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);