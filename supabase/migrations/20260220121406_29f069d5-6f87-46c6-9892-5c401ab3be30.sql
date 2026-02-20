
-- Update the "Need help?" contact block and branded footer in all 6 product-specific email templates

-- Define the old and new contact block strings to swap, and the old/new footer strings
-- We use a two-pass REPLACE per template to handle both the contact block and the footer row

-- ============================================================
-- Step 1: Fix the "Need help?" contact block (wrong email + phone)
-- ============================================================
UPDATE email_templates
SET html_body = REPLACE(
  REPLACE(
    html_body,
    '<p style="color:#555;font-size:14px;margin:0;">📧 Email: <a href="mailto:info@peacockpixelmedia.co.uk" style="color:#166534;">info@peacockpixelmedia.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">📞 Phone: 023 9298 9314</p>',
    '<p style="color:#555;font-size:14px;margin:0;">&#x2709; <a href="mailto:discover@discovermagazines.co.uk" style="color:#166534;">discover@discovermagazines.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">&#x1F4DE; <a href="tel:02380266388" style="color:#166534;">023 8026 6388</a></p>'
  ),
  -- Step 2: Replace the old plain-text footer row with the full branded footer
  '<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0 0 10px;text-align:center;"><strong>Peacock &amp; Pixel Ltd</strong> | Discover Magazine</p>
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Connecting South Hampshire communities since 2014</p>
</td></tr>',
  '<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
  <tr><td align="center" style="padding-bottom:16px;">
    <img src="https://peacockpixelmedia.co.uk/lovable-uploads/discover-logo.png" alt="Discover Magazine" style="max-width:160px;height:auto;display:block;margin:0 auto;" />
  </td></tr>
  <tr><td align="center" style="padding-bottom:8px;">
    <span style="color:#166534;font-size:15px;">&#x1F4DE;</span>
    <a href="tel:02380266388" style="color:#166534;text-decoration:none;font-size:14px;margin-left:4px;">023 8026 6388</a>
    <span style="color:#9ca3af;font-size:14px;margin:0 8px;">|</span>
    <span style="color:#166534;font-size:15px;">&#x2709;</span>
    <a href="mailto:discover@discovermagazines.co.uk" style="color:#166534;text-decoration:none;font-size:14px;margin-left:4px;">discover@discovermagazines.co.uk</a>
  </td></tr>
  <tr><td align="center" style="padding-bottom:16px;">
    <span style="color:#166534;font-size:15px;">&#x1F4CD;</span>
    <span style="color:#6b7280;font-size:13px;margin-left:4px;">30 Leigh Road, Eastleigh, SO50 9DT Hampshire</span>
  </td></tr>
  <tr><td align="center" style="padding-bottom:12px;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">Connecting South Hampshire communities since 2014</p>
  </td></tr>
  <tr><td align="center">
    <a href="https://discovermagazines.co.uk" style="color:#166534;font-size:13px;text-decoration:none;margin:0 8px;">Website</a>
    <span style="color:#d1d5db;">·</span>
    <a href="https://discovermagazines.co.uk/contact" style="color:#166534;font-size:13px;text-decoration:none;margin:0 8px;">Contact Us</a>
    <span style="color:#d1d5db;">·</span>
    <a href="https://discovermagazines.co.uk/advertising" style="color:#166534;font-size:13px;text-decoration:none;margin:0 8px;">Advertise</a>
  </td></tr>
</table>
</td></tr>'
)
WHERE name IN (
  'booking_bogof_customer',
  'booking_fixed_customer',
  'booking_leafleting_customer',
  'quote_bogof_customer',
  'quote_fixed_customer',
  'quote_leafleting_customer'
);
