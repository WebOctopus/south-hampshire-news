-- Add GHL sync columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS ghl_location_id TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_ghl_contact_id ON public.businesses(ghl_contact_id);

-- Create function to call outbound sync edge function
CREATE OR REPLACE FUNCTION public.notify_business_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Only sync if this is a GHL-linked business and not a recent sync (prevent loops)
  IF NEW.ghl_contact_id IS NOT NULL AND 
     (NEW.last_synced_at IS NULL OR NEW.last_synced_at < NOW() - INTERVAL '5 seconds') THEN
    
    payload := jsonb_build_object(
      'business_id', NEW.id,
      'ghl_contact_id', NEW.ghl_contact_id,
      'ghl_location_id', NEW.ghl_location_id
    );
    
    -- Use pg_net to call the edge function asynchronously
    PERFORM net.http_post(
      url := 'https://qajegkbvbpekdggtrupv.supabase.co/functions/v1/sync-business-to-ghl',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := payload
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for outbound sync
DROP TRIGGER IF EXISTS trigger_business_sync ON public.businesses;
CREATE TRIGGER trigger_business_sync
  AFTER UPDATE OF name, description, email, phone, website, address_line1, address_line2, city, postcode, category_id
  ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_business_sync();