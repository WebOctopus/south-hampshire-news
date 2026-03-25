UPDATE public.email_templates 
SET available_variables = array_cat(available_variables, ARRAY['number_of_leaflets', 'deposit_amount', 'remaining_amount', 'payment_terms']::text[])
WHERE name LIKE '%leaflet%' 
  AND NOT (available_variables @> ARRAY['deposit_amount']::text[]);