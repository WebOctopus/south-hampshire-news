-- Create business_claim_requests table for tracking ownership claims
CREATE TABLE public.business_claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_method TEXT, -- email, phone, document
  verification_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(business_id, user_id)
);

-- Enable RLS
ALTER TABLE public.business_claim_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own claim requests
CREATE POLICY "Users can view their own claim requests"
ON public.business_claim_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own claim requests
CREATE POLICY "Users can create claim requests"
ON public.business_claim_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all claim requests
CREATE POLICY "Admins can view all claim requests"
ON public.business_claim_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all claim requests
CREATE POLICY "Admins can update claim requests"
ON public.business_claim_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete claim requests
CREATE POLICY "Admins can delete claim requests"
ON public.business_claim_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_business_claim_requests_business_id ON public.business_claim_requests(business_id);
CREATE INDEX idx_business_claim_requests_user_id ON public.business_claim_requests(user_id);
CREATE INDEX idx_business_claim_requests_status ON public.business_claim_requests(status);