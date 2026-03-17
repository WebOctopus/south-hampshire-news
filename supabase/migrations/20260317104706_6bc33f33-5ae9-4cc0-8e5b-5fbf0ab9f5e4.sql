-- Add width="600" HTML attribute to all email templates for Outlook compatibility
DO $$
BEGIN
  UPDATE email_templates 
  SET html_body = REPLACE(
    html_body, 
    'style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;', 
    'width="600" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;'
  ),
  updated_at = now()
  WHERE html_body LIKE '%style="width:600px;max-width:100%'
  AND html_body NOT LIKE '%width="600"%';
END $$;