-- Convert div-based email templates to table-based layout for Outlook compatibility
DO $$
BEGIN
  UPDATE email_templates 
  SET html_body = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;"><table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;"><table role="presentation" width="600" style="width:600px;max-width:100%;border-collapse:collapse;">' || html_body || '</table></td></tr></table></body></html>',
  updated_at = now()
  WHERE name IN ('booking_confirmation_customer', 'booking_quote_admin', 'welcome_email')
  AND html_body NOT LIKE '%width="600"%';
END $$;