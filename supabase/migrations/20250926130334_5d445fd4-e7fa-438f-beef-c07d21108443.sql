-- Enhanced security for bookings table
-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Admin full access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Create enhanced RLS policies that restrict access to authenticated users only
-- and add additional security checks

-- Admin full access policy - only for authenticated admin users
CREATE POLICY "Admin full access to bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can only view their own bookings - authenticated users only
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can only create bookings for themselves - with additional validation
CREATE POLICY "Users can create their own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND contact_name IS NOT NULL 
  AND email IS NOT NULL
);

-- Users can only update their own bookings - authenticated users only
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
);

-- Users can only delete their own bookings - authenticated users only
CREATE POLICY "Users can delete their own bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Add a security function to validate booking data access
CREATE OR REPLACE FUNCTION public.validate_booking_access(booking_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Ensure the requesting user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Allow admins to access any booking
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN TRUE;
  END IF;
  
  -- Allow users to access only their own bookings
  RETURN auth.uid() = booking_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;