-- First check what exists in the user_roles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND table_schema = 'public';