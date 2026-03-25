UPDATE public.email_templates 
SET html_body = replace(
  html_body,
  '<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What Happens Next</h2>',
  '<div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin-bottom:25px;">
<h3 style="color:#1e40af;font-size:15px;margin:0 0 10px;">💳 Payment Terms</h3>
<table style="width:100%;border-collapse:collapse;">
<tr>
  <td style="padding:6px 0;border-bottom:1px solid #dbeafe;"><span style="color:#333;font-size:14px;font-weight:bold;">Campaign Cost + VAT</span></td>
  <td style="padding:6px 0;text-align:right;border-bottom:1px solid #dbeafe;"><span style="color:#1e40af;font-size:14px;font-weight:bold;">{{total_cost}}</span></td>
</tr>
<tr>
  <td style="padding:6px 0;border-bottom:1px solid #dbeafe;"><span style="color:#333;font-size:14px;font-weight:bold;">25% Deposit</span></td>
  <td style="padding:6px 0;text-align:right;border-bottom:1px solid #dbeafe;"><span style="color:#1e40af;font-size:14px;font-weight:bold;">{{deposit_amount}} + VAT</span></td>
</tr>
<tr>
  <td style="padding:6px 0;"><span style="color:#333;font-size:14px;font-weight:bold;">Remaining Balance</span><br><span style="color:#6b7280;font-size:12px;">Due 14 days before delivery date</span></td>
  <td style="padding:6px 0;text-align:right;vertical-align:top;"><span style="color:#1e40af;font-size:14px;font-weight:bold;">{{remaining_amount}} + VAT</span></td>
</tr>
</table>
</div>
<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What Happens Next</h2>'
)
WHERE name = 'booking_leafleting_customer';