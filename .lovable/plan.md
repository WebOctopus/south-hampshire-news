

## Fix Full-Width Email Rendering

### Problem
Several email templates render full-width instead of being constrained to ~600px, particularly in Outlook and other email clients that ignore CSS `max-width` on `<div>` elements.

Two categories of templates are affected:

**Category A — Div-based templates (worst offenders, no width constraint in Outlook):**
- `booking_confirmation_customer`
- `booking_quote_admin`  
- `quote_saved_customer`
- `welcome_email` (DB template)

These use `<div style="max-width: 600px; margin: 0 auto">` which Outlook completely ignores.

**Category B — All table-based templates (need HTML width attribute):**
- `quote_bogof_customer`, `quote_fixed_customer`, `quote_leafleting_customer`
- `booking_bogof_customer`, `booking_fixed_customer`, `booking_leafleting_customer`

These use CSS `style="width:600px"` but are missing the HTML `width="600"` attribute that Outlook requires.

### Solution

**1. Database templates (all 10 templates):**
Update each template's `html_body` to use the bulletproof email table pattern:
- Wrap content in `<table width="600" style="width:600px;max-width:600px;">` with both the HTML attribute AND inline CSS
- Convert the 4 div-based templates to table-based layout
- Add the HTML `width="600"` attribute to the 6 table-based templates that are missing it

**2. Hardcoded fallback templates in Edge Functions:**
- `send-welcome-email/index.ts` — add `width="600"` HTML attribute to the inner table
- `send-password-reset/index.ts` — add `width="600"` HTML attribute  
- `send-booking-confirmation-email/index.ts` — add `width="600"` to both admin and customer fallback HTML tables
- `admin-manage-user/index.ts` — convert div-based fallbacks to table layout with `width="600"`

**3. Redeploy all affected Edge Functions** after changes.

### What changes for each template

For table-based templates, the fix is minimal — change:
```html
<table role="presentation" style="width:600px;max-width:100%;...">
```
to:
```html
<table role="presentation" width="600" style="width:600px;max-width:100%;...">
```

For div-based templates, wrap content in the standard table pattern:
```html
<table role="presentation" style="width:100%"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" width="600" style="width:600px;max-width:100%;...">
  <!-- existing content moved here -->
</table>
</td></tr></table>
```

### Files to edit
- `supabase/functions/send-welcome-email/index.ts`
- `supabase/functions/send-password-reset/index.ts`
- `supabase/functions/send-booking-confirmation-email/index.ts`
- `supabase/functions/admin-manage-user/index.ts`
- Database: UPDATE all 10 `email_templates` rows to add `width="600"` attribute (or convert div-based ones to table layout)

