-- Fix the generate_voucher_code function to set proper search_path
CREATE OR REPLACE FUNCTION public.generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character alphanumeric code
        code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.vouchers WHERE voucher_code = code) INTO code_exists;
        
        -- Exit loop if code is unique
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;