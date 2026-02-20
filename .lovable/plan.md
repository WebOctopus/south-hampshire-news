
## Apply Branded Footer to the 6 New Database Email Templates

### The Problem

The 6 product-specific email templates inserted into the database during the previous session were created before the branded footer was built. They still contain:

- **Old footer**: Just "Peacock & Pixel Ltd | Discover Magazine" text with no logo, no contact details
- **Wrong contact info** in the "Need help?" box: `info@peacockpixelmedia.co.uk` and `023 9298 9314` (the old number)

The edge function fallback HTML already has the correct branded footer — it's only the database-stored template bodies that are behind.

### Templates Affected (all 6)

| Template Name | Display Name |
|---|---|
| `booking_bogof_customer` | Booking Confirmation — 3+ Repeat Package |
| `booking_fixed_customer` | Booking Confirmation — Fixed Term |
| `booking_leafleting_customer` | Booking Confirmation — Leafleting |
| `quote_bogof_customer` | Quote Saved — 3+ Repeat Package |
| `quote_fixed_customer` | Quote Saved — Fixed Term |
| `quote_leafleting_customer` | Quote Saved — Leafleting |

### What Will Be Updated

**1. The "Need help?" contact block** (inside the email body, above the footer)

Replacing the old wrong details:
```
Email: info@peacockpixelmedia.co.uk
Phone: 023 9298 9314
```

With the correct branded contact info:
```
✉ discover@discovermagazines.co.uk
📞 023 8026 6388
```

**2. The footer row** at the bottom of each template

Replacing the old plain-text footer:
```html
<p>Peacock &amp; Pixel Ltd | Discover Magazine</p>
<p>Connecting South Hampshire communities since 2014</p>
```

With the full branded footer matching the edge function fallback:
- Discover Magazine logo image (max-width: 160px)
- 📞 023 8026 6388 (linked, tel:)
- ✉ discover@discovermagazines.co.uk (linked, mailto:)
- 📍 30 Leigh Road, Eastleigh, SO50 9DT Hampshire
- Tagline: "Connecting South Hampshire communities since 2014"
- Three footer links: Website · Contact Us · Advertise

### How It's Done

A single SQL `UPDATE` statement per template will replace the `html_body` column value for all 6 templates in the `email_templates` table. This is the same approach as any template edit made through the admin UI — no edge function redeployment is needed since the templates are loaded from the database at send time.

### No Risk to Other Templates

- The existing generic templates (`quote_saved_customer`, `booking_confirmation_customer`, `booking_quote_admin`, `welcome_email`) are not touched — they were already updated in the previous branded footer session.
- All product-specific content (variables, summary tables, next steps) within each template body is preserved — only the footer row and the "Need help?" contact block are changed.
