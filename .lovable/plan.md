

## Plan: Admin Email Template Editor

### Overview
Add an "Email Templates" section to the admin dashboard where admins can view, edit, and preview email templates stored in Supabase. The edge functions will then pull templates from the database at runtime, falling back to hardcoded HTML if no template is found.

### Step 1: Create the `email_templates` database table

```sql
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  available_variables text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admin full access to email templates"
  ON public.email_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Edge functions need to read templates (service role bypasses RLS, so no extra policy needed)
```

Seed the table with 4 default templates derived from the current hardcoded HTML:

| name | display_name | Available Variables |
|------|-------------|-------------------|
| `booking_confirmation_customer` | Booking Confirmation (Customer) | `{{customer_name}}`, `{{package_type}}`, `{{ad_size}}`, `{{duration}}`, `{{circulation}}`, `{{total_cost}}`, `{{dashboard_url}}` |
| `quote_saved_customer` | Quote Saved (Customer) | Same as above |
| `booking_quote_admin` | New Booking/Quote (Admin) | `{{type_label}}`, `{{model_label}}`, `{{customer_name}}`, `{{email}}`, `{{phone}}`, `{{company}}`, `{{details_table}}`, `{{admin_url}}` |
| `welcome_email` | Welcome Email | `{{customer_name}}`, `{{dashboard_url}}` |

### Step 2: Create `EmailTemplatesManagement` admin component

**New file:** `src/components/admin/EmailTemplatesManagement.tsx`

Features:
- **List view**: Table showing template display name, subject line, and last edited date with "Edit" buttons
- **Edit view**: Opens when clicking "Edit", containing:
  - Text input for subject line
  - A `<textarea>` styled as a code editor (monospace font, dark background) for the HTML body -- avoids needing heavy external dependencies like Monaco/CodeMirror
  - A live preview panel (rendered via `dangerouslySetInnerHTML` in a sandboxed container) alongside the editor
  - An "Available Variables" reference showing which `{{placeholders}}` the template supports
  - Save and Cancel buttons
  - "Send Test Email" button that invokes a small helper to send the template to the admin's own email
- Uses split-pane layout: editor on left, preview on right (using CSS grid)

### Step 3: Register in Admin Dashboard

**Files to modify:**

| File | Change |
|------|--------|
| `src/components/admin/AdminSidebar.tsx` | Add "Email Templates" menu item with `Mail` icon, section `"email-templates"` |
| `src/pages/AdminDashboard.tsx` | Import `EmailTemplatesManagement`, add `case 'email-templates'` to `renderContent()` |

### Step 4: Update edge functions to use database templates

**Files to modify:**

| Edge Function | Change |
|---------------|--------|
| `supabase/functions/send-booking-confirmation-email/index.ts` | Create Supabase client, query `email_templates` by name, replace `{{variables}}` in the fetched HTML. Fall back to current hardcoded HTML if no template found. |
| `supabase/functions/send-welcome-email/index.ts` | Same pattern: query `welcome_email` template, replace `{{customer_name}}` and `{{dashboard_url}}`, fall back to hardcoded HTML. |

The template variable replacement is a simple string replace loop:
```typescript
function applyTemplate(html: string, vars: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
```

Edge functions will use the **service role key** (already available as `SUPABASE_SERVICE_ROLE_KEY`) to bypass RLS and read templates.

### Step 5: Deploy and test

- Deploy updated edge functions
- Seed default templates into the database
- Test editing a template in the admin panel and verifying the preview
- Test sending a booking to confirm the database template is used

### Technical Notes

- No new npm dependencies required -- the HTML editor uses a styled `<textarea>` with monospace font, avoiding the need for CodeMirror/Monaco
- The live preview uses `dangerouslySetInnerHTML` in a bordered container with sample data replacing the `{{variables}}` for realistic preview
- The `password_reset` template is excluded initially because it contains dynamic reset URLs that are more complex to template
- All template reads in edge functions are wrapped in try/catch so a database failure never prevents email sending (hardcoded fallback always works)

