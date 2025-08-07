-- First, let's check what's in the auth.users table for this email
SELECT id, email FROM auth.users WHERE email = 'melanie@discovermagazines.co.uk';

-- Try to insert directly into user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
    id, 
    'admin'
FROM auth.users 
WHERE email = 'melanie@discovermagazines.co.uk'
ON CONFLICT (user_id, role) DO NOTHING;