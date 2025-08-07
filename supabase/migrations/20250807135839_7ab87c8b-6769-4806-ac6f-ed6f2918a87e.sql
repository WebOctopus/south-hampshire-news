-- Check existing types
SELECT typname FROM pg_type WHERE typname = 'app_role';

-- Check existing data in user_roles to understand current structure
SELECT role FROM public.user_roles LIMIT 5;

-- Create the app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Recreate the assign_admin_role function
CREATE OR REPLACE FUNCTION public.assign_admin_role(user_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID from the email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;
    
    -- Check if user exists
    IF target_user_id IS NULL THEN
        RETURN 'User not found with email: ' || user_email;
    END IF;
    
    -- Insert or update the user role to admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN 'Admin role assigned successfully to: ' || user_email;
END;
$function$;