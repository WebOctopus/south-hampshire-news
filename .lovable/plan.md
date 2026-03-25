

## Update Leafleting Email Templates with Price Breakdown Variables

### What changes
Update both leafleting email templates (quote and booking confirmation) stored in the `email_templates` database table to use the actual calculated `{{deposit_amount}}` and `{{remaining_amount}}` variables instead of static "25% of total cost" / "75% of total cost" text.

### Changes

**Database migration** — Update the `quote_leafleting_customer` template:

In the Payment Terms section, replace the static text with actual values:
- "25% of total cost" → `{{deposit_amount}} + VAT`
- "75% of total cost" → `{{remaining_amount}} + VAT`

This keeps the entire existing template structure intact (header, quote summary, leaflet supply notice, what happens next, dashboard button, footer) — only the two payment amount cells change.

**Also update `booking_leafleting_customer`** template to add a Payment Terms section (it currently lacks one) between the Booking Summary and "What Happens Next" sections, matching the same style as the quote template, showing:
- Campaign Cost: `{{total_cost}}` + VAT
- 25% Deposit: `{{deposit_amount}}` + VAT  
- Remaining Balance: `{{remaining_amount}}` + VAT

### Technical Details

Single SQL migration using two `UPDATE` statements on `public.email_templates`:
1. For `quote_leafleting_customer`: targeted string replacement within `html_body` to swap the two static payment amount cells with the template variables
2. For `booking_leafleting_customer`: insert a Payment Terms `<div>` block after the closing `</div>` of the Booking Summary section

No Edge Function changes needed — the variables are already being resolved correctly.

