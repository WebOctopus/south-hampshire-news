UPDATE email_templates 
SET available_variables = array_cat(available_variables, ARRAY['dimensions', 'areas_selected']),
    updated_at = now()
WHERE name IN ('booking_bogof_customer', 'quote_bogof_customer')
AND NOT (available_variables @> ARRAY['dimensions']);