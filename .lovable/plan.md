

## Fix: Existing Customer Handling in Admin Quote Creation

### Problem
When an admin creates a quote for an existing customer, the email still tries to include login credentials (with an undefined/empty password). For existing users, we should just provide a login link and mention the "Forgot password" option.

### Changes

**1. `src/components/AdvertisingStepForm.tsx`** (~2 locations: `handleContactInfoSave` and `handleContactInfoBook`)
- Track whether the user was newly created vs already existed (the `isNewUser` flag already exists)
- When sending the confirmation email, pass different flags:
  - New user: `is_admin_created: true` + `generated_password` (current behavior)
  - Existing user: `is_admin_created: true` + `is_existing_user: true` (no password)

**2. `supabase/functions/send-booking-confirmation-email/index.ts`**
- Add `is_existing_user?: boolean` to the `EmailPayload` interface
- Update line 237: when `is_admin_created && is_existing_user`, show a different block with just a login link and "Forgot password" hint instead of credentials
- Create a new `buildExistingUserLoginHtml()` function that renders:
  - "A quote has been created for you"
  - "Log in to your dashboard" button linking to `https://peacockpixelmedia.co.uk/auth`
  - "Forgot your password? Use the 'Forgot Password' link on the login page to reset it"

### No other files need changes

