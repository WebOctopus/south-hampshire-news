
-- Insert 6 product-specific email templates (skip if already exist)

INSERT INTO public.email_templates (name, display_name, subject, html_body, available_variables)
VALUES
  -- Quote: Fixed Term
  (
    'quote_fixed_customer',
    'Quote Saved — Fixed Term (Customer)',
    'Your Fixed Term Quote Has Been Saved – Discover Magazine',
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f4f4f4;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Quote Saved</h1>
<p style="color:#bbf7d0;margin:10px 0 0;font-size:16px;">Fixed Term Advertising — Discover Magazine</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#333;font-size:18px;margin:0 0 20px;">Hi {{customer_name}},</p>
<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 20px;">
Your Fixed Term advertising quote has been saved. Here''s a summary of what you''ve selected:
</p>
<div style="background-color:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#166534;font-size:18px;margin:0 0 12px;">Quote Summary</h2>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Ad Size</td><td style="padding:8px 0;color:#555;text-align:right;">{{ad_size}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Duration</td><td style="padding:8px 0;color:#555;text-align:right;">{{duration}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Circulation</td><td style="padding:8px 0;color:#555;text-align:right;">{{circulation}} copies</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Monthly Price</td><td style="padding:8px 0;color:#555;text-align:right;">{{monthly_price}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Duration Discount</td><td style="padding:8px 0;color:#555;text-align:right;">{{duration_discount}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Total Cost</td><td style="padding:8px 0;color:#555;text-align:right;font-size:18px;font-weight:bold;color:#166534;">{{total_cost}}</td></tr>
</table>
</div>
<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What to do next</h2>
<ol style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
<li><strong>Log in to your dashboard</strong> to review your quote</li>
<li><strong>When you''re ready</strong>, convert your quote to a booking</li>
<li><strong>Set up payment</strong> to confirm your campaign</li>
</ol>
</div>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
<tr><td align="center">
<a href="{{dashboard_url}}" style="display:inline-block;background-color:#166534;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-weight:bold;font-size:16px;">Go to Your Dashboard</a>
</td></tr></table>
<div style="background-color:#f9fafb;border-radius:8px;padding:20px;">
<p style="color:#555;font-size:14px;margin:0 0 8px;"><strong>Need help?</strong></p>
<p style="color:#555;font-size:14px;margin:0;">📧 Email: <a href="mailto:info@peacockpixelmedia.co.uk" style="color:#166534;">info@peacockpixelmedia.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">📞 Phone: 023 9298 9314</p>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0 0 10px;text-align:center;"><strong>Peacock &amp; Pixel Ltd</strong> | Discover Magazine</p>
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Connecting South Hampshire communities since 2014</p>
</td></tr>
</table></td></tr></table></body></html>',
    ARRAY['customer_name','ad_size','duration','circulation','total_cost','monthly_price','duration_discount','dashboard_url']
  ),

  -- Quote: 3+ Repeat (bogof)
  (
    'quote_bogof_customer',
    'Quote Saved — 3+ Repeat Package (Customer)',
    'Your 3+ Repeat Package Quote Has Been Saved – Discover Magazine',
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f4f4f4;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Quote Saved</h1>
<p style="color:#bbf7d0;margin:10px 0 0;font-size:16px;">3+ Repeat Package — Discover Magazine</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#333;font-size:18px;margin:0 0 20px;">Hi {{customer_name}},</p>
<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 20px;">
Your 3+ Repeat Package quote has been saved. This package gives you great value by including free areas alongside your paid areas:
</p>
<div style="background-color:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#166534;font-size:18px;margin:0 0 12px;">Quote Summary</h2>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Ad Size</td><td style="padding:8px 0;color:#555;text-align:right;">{{ad_size}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Paid Areas</td><td style="padding:8px 0;color:#555;text-align:right;">{{paid_areas}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Free Areas (Bonus!)</td><td style="padding:8px 0;color:#15803d;text-align:right;font-weight:bold;">{{free_areas}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Total Circulation</td><td style="padding:8px 0;color:#555;text-align:right;">{{total_circulation}} copies</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Monthly Price</td><td style="padding:8px 0;color:#555;text-align:right;">{{monthly_price}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Total Cost</td><td style="padding:8px 0;color:#555;text-align:right;font-size:18px;font-weight:bold;color:#166534;">{{total_cost}}</td></tr>
</table>
</div>
<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What to do next</h2>
<ol style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
<li><strong>Log in to your dashboard</strong> to review your quote</li>
<li><strong>When you''re ready</strong>, convert your quote to a booking</li>
<li><strong>Set up payment</strong> to confirm your campaign</li>
</ol>
</div>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
<tr><td align="center">
<a href="{{dashboard_url}}" style="display:inline-block;background-color:#166534;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-weight:bold;font-size:16px;">Go to Your Dashboard</a>
</td></tr></table>
<div style="background-color:#f9fafb;border-radius:8px;padding:20px;">
<p style="color:#555;font-size:14px;margin:0 0 8px;"><strong>Need help?</strong></p>
<p style="color:#555;font-size:14px;margin:0;">📧 Email: <a href="mailto:info@peacockpixelmedia.co.uk" style="color:#166534;">info@peacockpixelmedia.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">📞 Phone: 023 9298 9314</p>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0 0 10px;text-align:center;"><strong>Peacock &amp; Pixel Ltd</strong> | Discover Magazine</p>
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Connecting South Hampshire communities since 2014</p>
</td></tr>
</table></td></tr></table></body></html>',
    ARRAY['customer_name','ad_size','paid_areas','free_areas','total_circulation','total_cost','monthly_price','dashboard_url']
  ),

  -- Quote: Leafleting
  (
    'quote_leafleting_customer',
    'Quote Saved — Leafleting (Customer)',
    'Your Leafleting Quote Has Been Saved – Discover Magazine',
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f4f4f4;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Quote Saved</h1>
<p style="color:#bbf7d0;margin:10px 0 0;font-size:16px;">Leafleting Service — Discover Magazine</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#333;font-size:18px;margin:0 0 20px;">Hi {{customer_name}},</p>
<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 20px;">
Your leafleting quote has been saved. Here''s a summary of your planned campaign:
</p>
<div style="background-color:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#166534;font-size:18px;margin:0 0 12px;">Quote Summary</h2>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Leaflet Size</td><td style="padding:8px 0;color:#555;text-align:right;">{{leaflet_size}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Number of Areas</td><td style="padding:8px 0;color:#555;text-align:right;">{{number_of_areas}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Distribution Start</td><td style="padding:8px 0;color:#555;text-align:right;">{{distribution_start}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Total Cost</td><td style="padding:8px 0;color:#555;text-align:right;font-size:18px;font-weight:bold;color:#166534;">{{total_cost}}</td></tr>
</table>
</div>
<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What to do next</h2>
<ol style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
<li><strong>Log in to your dashboard</strong> to review your quote</li>
<li><strong>When you''re ready</strong>, convert your quote to a booking</li>
<li><strong>Provide your print-ready leaflets</strong> before the distribution date</li>
</ol>
</div>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
<tr><td align="center">
<a href="{{dashboard_url}}" style="display:inline-block;background-color:#166534;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-weight:bold;font-size:16px;">Go to Your Dashboard</a>
</td></tr></table>
<div style="background-color:#f9fafb;border-radius:8px;padding:20px;">
<p style="color:#555;font-size:14px;margin:0 0 8px;"><strong>Need help?</strong></p>
<p style="color:#555;font-size:14px;margin:0;">📧 Email: <a href="mailto:info@peacockpixelmedia.co.uk" style="color:#166534;">info@peacockpixelmedia.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">📞 Phone: 023 9298 9314</p>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0 0 10px;text-align:center;"><strong>Peacock &amp; Pixel Ltd</strong> | Discover Magazine</p>
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Connecting South Hampshire communities since 2014</p>
</td></tr>
</table></td></tr></table></body></html>',
    ARRAY['customer_name','leaflet_size','number_of_areas','distribution_start','total_cost','dashboard_url']
  ),

  -- Booking: Fixed Term
  (
    'booking_fixed_customer',
    'Booking Confirmation — Fixed Term (Customer)',
    'Your Fixed Term Booking is Confirmed – Discover Magazine',
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f4f4f4;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Booking Confirmed!</h1>
<p style="color:#bbf7d0;margin:10px 0 0;font-size:16px;">Fixed Term Advertising — Discover Magazine</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#333;font-size:18px;margin:0 0 20px;">Hi {{customer_name}},</p>
<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 20px;">
Thank you for booking with Discover Magazine! Your Fixed Term advertising campaign is confirmed. Here''s your booking summary:
</p>
<div style="background-color:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#166534;font-size:18px;margin:0 0 12px;">Booking Summary</h2>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Ad Size</td><td style="padding:8px 0;color:#555;text-align:right;">{{ad_size}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Duration</td><td style="padding:8px 0;color:#555;text-align:right;">{{duration}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Circulation</td><td style="padding:8px 0;color:#555;text-align:right;">{{circulation}} copies</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Monthly Price</td><td style="padding:8px 0;color:#555;text-align:right;">{{monthly_price}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Duration Discount</td><td style="padding:8px 0;color:#555;text-align:right;">{{duration_discount}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Total Cost</td><td style="padding:8px 0;color:#555;text-align:right;font-size:18px;font-weight:bold;color:#166534;">{{total_cost}}</td></tr>
</table>
</div>
<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What to do next</h2>
<ol style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
<li><strong>Log in to your dashboard</strong> to view your booking details</li>
<li><strong>Set up your Direct Debit payment</strong> via GoCardless</li>
<li><strong>We''ll confirm your campaign schedule</strong> and send you the details</li>
<li><strong>Your advert will appear</strong> in the next available issue</li>
</ol>
</div>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
<tr><td align="center">
<a href="{{dashboard_url}}" style="display:inline-block;background-color:#166534;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-weight:bold;font-size:16px;">Go to Your Dashboard</a>
</td></tr></table>
<div style="background-color:#f9fafb;border-radius:8px;padding:20px;">
<p style="color:#555;font-size:14px;margin:0 0 8px;"><strong>Need help?</strong></p>
<p style="color:#555;font-size:14px;margin:0;">📧 Email: <a href="mailto:info@peacockpixelmedia.co.uk" style="color:#166534;">info@peacockpixelmedia.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">📞 Phone: 023 9298 9314</p>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0 0 10px;text-align:center;"><strong>Peacock &amp; Pixel Ltd</strong> | Discover Magazine</p>
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Connecting South Hampshire communities since 2014</p>
</td></tr>
</table></td></tr></table></body></html>',
    ARRAY['customer_name','ad_size','duration','circulation','total_cost','monthly_price','duration_discount','dashboard_url']
  ),

  -- Booking: 3+ Repeat (bogof)
  (
    'booking_bogof_customer',
    'Booking Confirmation — 3+ Repeat Package (Customer)',
    'Your 3+ Repeat Package Booking is Confirmed – Discover Magazine',
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f4f4f4;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Booking Confirmed!</h1>
<p style="color:#bbf7d0;margin:10px 0 0;font-size:16px;">3+ Repeat Package — Discover Magazine</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#333;font-size:18px;margin:0 0 20px;">Hi {{customer_name}},</p>
<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 20px;">
Thank you for booking with Discover Magazine! Your 3+ Repeat Package is confirmed, including your bonus free areas:
</p>
<div style="background-color:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#166534;font-size:18px;margin:0 0 12px;">Booking Summary</h2>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Ad Size</td><td style="padding:8px 0;color:#555;text-align:right;">{{ad_size}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Paid Areas</td><td style="padding:8px 0;color:#555;text-align:right;">{{paid_areas}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Free Areas (Bonus!)</td><td style="padding:8px 0;color:#15803d;text-align:right;font-weight:bold;">{{free_areas}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Total Circulation</td><td style="padding:8px 0;color:#555;text-align:right;">{{total_circulation}} copies</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Monthly Price</td><td style="padding:8px 0;color:#555;text-align:right;">{{monthly_price}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Total Cost</td><td style="padding:8px 0;color:#555;text-align:right;font-size:18px;font-weight:bold;color:#166534;">{{total_cost}}</td></tr>
</table>
</div>
<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What to do next</h2>
<ol style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
<li><strong>Log in to your dashboard</strong> to view your booking details</li>
<li><strong>Set up your Direct Debit payment</strong> via GoCardless</li>
<li><strong>We''ll confirm your campaign schedule</strong> and send you the details</li>
<li><strong>Your advert will appear</strong> in the next available issue</li>
</ol>
</div>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
<tr><td align="center">
<a href="{{dashboard_url}}" style="display:inline-block;background-color:#166534;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-weight:bold;font-size:16px;">Go to Your Dashboard</a>
</td></tr></table>
<div style="background-color:#f9fafb;border-radius:8px;padding:20px;">
<p style="color:#555;font-size:14px;margin:0 0 8px;"><strong>Need help?</strong></p>
<p style="color:#555;font-size:14px;margin:0;">📧 Email: <a href="mailto:info@peacockpixelmedia.co.uk" style="color:#166534;">info@peacockpixelmedia.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">📞 Phone: 023 9298 9314</p>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0 0 10px;text-align:center;"><strong>Peacock &amp; Pixel Ltd</strong> | Discover Magazine</p>
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Connecting South Hampshire communities since 2014</p>
</td></tr>
</table></td></tr></table></body></html>',
    ARRAY['customer_name','ad_size','paid_areas','free_areas','total_circulation','total_cost','monthly_price','dashboard_url']
  ),

  -- Booking: Leafleting
  (
    'booking_leafleting_customer',
    'Booking Confirmation — Leafleting (Customer)',
    'Your Leafleting Booking is Confirmed – Discover Magazine',
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#f4f4f4;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Booking Confirmed!</h1>
<p style="color:#bbf7d0;margin:10px 0 0;font-size:16px;">Leafleting Service — Discover Magazine</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#333;font-size:18px;margin:0 0 20px;">Hi {{customer_name}},</p>
<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 20px;">
Thank you for booking with Discover Magazine! Your leafleting campaign is confirmed. Here''s your booking summary:
</p>
<div style="background-color:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#166534;font-size:18px;margin:0 0 12px;">Booking Summary</h2>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Leaflet Size</td><td style="padding:8px 0;color:#555;text-align:right;">{{leaflet_size}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Number of Areas</td><td style="padding:8px 0;color:#555;text-align:right;">{{number_of_areas}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Distribution Start</td><td style="padding:8px 0;color:#555;text-align:right;">{{distribution_start}}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">Total Cost</td><td style="padding:8px 0;color:#555;text-align:right;font-size:18px;font-weight:bold;color:#166534;">{{total_cost}}</td></tr>
</table>
</div>
<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What to do next</h2>
<ol style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
<li><strong>Log in to your dashboard</strong> to view your booking details</li>
<li><strong>Set up your Direct Debit payment</strong> via GoCardless</li>
<li><strong>Provide your print-ready leaflets</strong> before the distribution date</li>
<li><strong>We''ll distribute your leaflets</strong> on the scheduled date</li>
</ol>
</div>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
<tr><td align="center">
<a href="{{dashboard_url}}" style="display:inline-block;background-color:#166534;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-weight:bold;font-size:16px;">Go to Your Dashboard</a>
</td></tr></table>
<div style="background-color:#f9fafb;border-radius:8px;padding:20px;">
<p style="color:#555;font-size:14px;margin:0 0 8px;"><strong>Need help?</strong></p>
<p style="color:#555;font-size:14px;margin:0;">📧 Email: <a href="mailto:info@peacockpixelmedia.co.uk" style="color:#166534;">info@peacockpixelmedia.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">📞 Phone: 023 9298 9314</p>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0 0 10px;text-align:center;"><strong>Peacock &amp; Pixel Ltd</strong> | Discover Magazine</p>
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Connecting South Hampshire communities since 2014</p>
</td></tr>
</table></td></tr></table></body></html>',
    ARRAY['customer_name','leaflet_size','number_of_areas','distribution_start','total_cost','dashboard_url']
  )

ON CONFLICT (name) DO NOTHING;
