-- Create the app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END $$;

-- Now assign admin role to melanie@discovermagazines.co.uk
SELECT public.assign_admin_role('melanie@discovermagazines.co.uk');