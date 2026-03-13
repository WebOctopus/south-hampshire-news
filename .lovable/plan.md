

## Admin "Create Quote on Behalf of Customer" via Cost Calculator

### Overview

Add an admin-only mode to the Cost Calculator's contact step that lets admins create quotes/bookings on behalf of customers. When used for a new customer, a user account is auto-created via the `admin-manage-user` edge function, and the quote confirmation email includes their login credentials so they can access their dashboard.

### How It Works

1. **Admin detection**: The `ContactInformationStep` component already has access to the auth context. We add `useAuth()` to detect `isAdmin`.

2. **Admin-only "On Behalf Of" toggle**: When `isAdmin === true`, show a highlighted section at the top of the contact form with a switch: "Create on behalf of a customer". When enabled:
   - The password field is **hidden** (admin doesn't need to set one — a random password is auto-generated)
   - A note appears: "A login will be created automatically and credentials emailed to the customer"

3. **Modified save flow** (in `AdvertisingStepForm.tsx` `handleContactInfoSave` / `handleContactInfoBook`):
   - When admin mode is active, instead of `supabase.auth.signUp()`, call the `admin-manage-user` edge function with `action: 'create_user'` + `send_email: true` to create the user account without changing the admin's own session
   - Use the returned `user_id` to save the quote/booking
   - The admin stays logged in as themselves (no session switch)
   - The customer gets a branded email with their credentials and a link to the dashboard

4. **Quote confirmation email enhancement**: The existing `send-booking-confirmation-email` edge function already sends a quote email. We add a `login_credentials` section to the quote email when `is_admin_created: true` is passed, including the auto-generated password and a "Log in to view your quote" CTA button pointing to `https://peacockpixelmedia.co.uk/auth`.

### Files Changed

| File | Change |
|---|---|
| `src/components/ContactInformationStep.tsx` | Add `isAdmin` detection via `useAuth()`. Add "On behalf of customer" switch (admin-only). Hide password field when admin mode active. Pass `isAdminCreating` flag to parent via `onSaveQuote`/`onBookNow`. Auto-generate random password in admin mode. |
| `src/components/AdvertisingStepForm.tsx` | In `handleContactInfoSave` and `handleContactInfoBook`: when `contactData.isAdminCreating`, call `admin-manage-user` with `create_user` action instead of `signUp()`, skip session switching, use returned `user_id`. Pass `is_admin_created: true` + `generated_password` to the confirmation email function. |
| `supabase/functions/send-booking-confirmation-email/index.ts` | When `is_admin_created: true`, inject login credentials block into the customer quote email with email, password, and login button. |

### Technical Details

- Random password generation: `crypto.randomUUID().slice(0, 12)` (client-side, passed to edge function)
- Admin mode flag travels through the existing `onSaveQuote(formData)` callback as `formData.isAdminCreating = true` and `formData.generatedPassword`
- The `admin-manage-user` edge function already supports `create_user` with `send_email` — but for this flow we skip the generic credentials email and instead include credentials in the **quote-specific** confirmation email for better context
- No database changes needed — quotes/bookings tables already support all fields
- Admin's auth session is preserved because we use the edge function (service role) instead of `signUp()`

