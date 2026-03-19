-- Add business_name to available_variables for all email templates
UPDATE email_templates SET available_variables = array_append(available_variables, 'business_name')
WHERE NOT ('business_name' = ANY(available_variables));