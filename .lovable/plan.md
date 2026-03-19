

## Add `business_name` Variable to Email Templates

### What changes

The `company` field from the booking contact form already captures the business name, but the variable name `company` isn't intuitive for email template editing. We'll add a `business_name` variable that pulls from the same `company` field on bookings.

### Changes

**1. Edge Function: `supabase/functions/send-booking-confirmation-email/index.ts`**
- Add `business_name` to the `vars` object, mapped to `payload.company || ""` (same source as `company`)
- Also add it to the admin notification vars (~line 330)

**2. Admin UI: `src/components/admin/EmailTemplatesManagement.tsx`**
- Add `business_name: "Smith & Co Ltd"` to the `SAMPLE_DATA` preview dictionary

**3. Database: Update `available_variables` on all email templates**
- Add `"business_name"` to the `available_variables` array for every template row so it appears as a clickable badge in the editor

### How it works
- Admins see `{{business_name}}` as an available variable in the template editor
- When emails are sent, `{{business_name}}` resolves to the company/business name from the booking's contact form
- The existing `{{company}}` variable continues to work as before

