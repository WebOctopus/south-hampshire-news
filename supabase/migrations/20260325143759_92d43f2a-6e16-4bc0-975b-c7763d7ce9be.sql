-- Quote template: replace static payment amounts with dynamic variables
UPDATE public.email_templates 
SET html_body = replace(
  replace(
    html_body,
    '<span style="color:#1e40af;font-size:14px;font-weight:bold;">25% of total cost</span>',
    '<span style="color:#1e40af;font-size:14px;font-weight:bold;">{{deposit_amount}} + VAT</span>'
  ),
  '<span style="color:#1e40af;font-size:14px;font-weight:bold;">75% of total cost</span>',
  '<span style="color:#1e40af;font-size:14px;font-weight:bold;">{{remaining_amount}} + VAT</span>'
)
WHERE name = 'quote_leafleting_customer';

-- Booking template: add Payment Terms section after the Booking Summary div
UPDATE public.email_templates 
SET html_body = replace(
  html_body,
  '<!-- Payment Terms -->',
  E'<!-- Payment Terms -->\n<div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin-bottom:25px;">\n<h3 style="color:#1e40af;font-size:15px;margin:0 0 10px;">💳 Payment Terms</h3>\n<table style="width:100%;border-collapse:collapse;">\n<tr>\n  <td style="padding:6px 0;border-bottom:1px solid #dbeafe;"><span style="color:#333;font-size:14px;font-weight:bold;">Campaign Cost + VAT</span></td>\n  <td style="padding:6px 0;text-align:right;border-bottom:1px solid #dbeafe;"><span style="color:#1e40af;font-size:14px;font-weight:bold;">{{total_cost}}</span></td>\n</tr>\n<tr>\n  <td style="padding:6px 0;border-bottom:1px solid #dbeafe;"><span style="color:#333;font-size:14px;font-weight:bold;">25% Deposit</span></td>\n  <td style="padding:6px 0;text-align:right;border-bottom:1px solid #dbeafe;"><span style="color:#1e40af;font-size:14px;font-weight:bold;">{{deposit_amount}} + VAT</span></td>\n</tr>\n<tr>\n  <td style="padding:6px 0;"><span style="color:#333;font-size:14px;font-weight:bold;">Remaining Balance</span><br><span style="color:#6b7280;font-size:12px;">Due 14 days before delivery date</span></td>\n  <td style="padding:6px 0;text-align:right;vertical-align:top;"><span style="color:#1e40af;font-size:14px;font-weight:bold;">{{remaining_amount}} + VAT</span></td>\n</tr>\n</table>\n</div>'
)
WHERE name = 'booking_leafleting_customer';