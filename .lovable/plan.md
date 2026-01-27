

## Plan: Email Journey with Resend & Supabase

### Overview
Implement two email flows using Resend and Supabase Edge Functions:
1. **Welcome Email** - Sent when a new user registers
2. **Password Reset Email** - Sent when a user requests a password reset

---

### Prerequisites

#### 1. Resend Account Setup
- Sign up at https://resend.com if you don't have an account
- Create an API key at https://resend.com/api-keys
- **Important**: Verify your email domain at https://resend.com/domains (required for production emails)

#### 2. Add RESEND_API_KEY Secret
We'll add the Resend API key as a Supabase secret so edge functions can use it.

---

### Part 1: Welcome Email

#### Edge Function: `send-welcome-email`

Create a new edge function at `supabase/functions/send-welcome-email/index.ts` that:
- Receives new user data (email, display name)
- Sends a branded welcome email using Resend
- Uses React Email for beautiful, responsive templates

**Email Template will include:**
- Peacock & Pixel / Discover branding
- Welcome message with user's name
- Quick start tips for using the platform
- Links to key features (dashboard, directory, advertising)

#### Trigger: After Sign-Up
Modify `src/pages/Auth.tsx` to call the welcome email edge function after successful registration.

---

### Part 2: Password Reset Email

#### Edge Function: `send-password-reset`

Create a new edge function at `supabase/functions/send-password-reset/index.ts` that:
- Generates a secure password reset link using Supabase Auth
- Sends a branded password reset email via Resend
- Includes expiry notice and security tips

#### Frontend: Add Forgot Password Flow

**File: `src/pages/Auth.tsx`**
Add a "Forgot Password?" link below the sign-in form that:
- Shows a modal/form to enter email
- Calls `supabase.auth.resetPasswordForEmail()` 
- Triggers the custom email edge function

**File: `src/pages/ResetPassword.tsx`** (New Page)
Create a page for users to set their new password after clicking the email link:
- Accessible at `/reset-password`
- Shows password fields
- Calls `supabase.auth.updateUser()` to set new password

---

### Implementation Details

#### 1. Config Update: `supabase/config.toml`
Add new edge function configurations:
```toml
[functions.send-welcome-email]
verify_jwt = false

[functions.send-password-reset]
verify_jwt = false
```

#### 2. Welcome Email Edge Function Structure
```typescript
// supabase/functions/send-welcome-email/index.ts
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  // Handle CORS
  // Parse request body (email, displayName)
  // Send branded welcome email
  // Return success/error response
});
```

#### 3. Password Reset Edge Function Structure
```typescript
// supabase/functions/send-password-reset/index.ts
import { Resend } from 'npm:resend@4.0.0';

Deno.serve(async (req) => {
  // Handle CORS
  // Parse email from request
  // Generate reset token using Supabase Auth
  // Send branded password reset email
  // Return success response
});
```

#### 4. Auth.tsx Updates
- Add "Forgot Password?" link
- Add modal/dialog for entering email
- Call password reset edge function
- Show confirmation message

#### 5. New Route: `/reset-password`
- Add route in `App.tsx`
- Create `ResetPassword.tsx` page with:
  - Password input fields
  - Validation (min 6 chars, match confirmation)
  - Submit to `supabase.auth.updateUser()`

---

### Email Branding

Both emails will include:
- Discover Magazine logo/branding
- Consistent color scheme (community-green)
- Mobile-responsive design
- Footer with contact info and unsubscribe (for GDPR compliance)

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/send-welcome-email/index.ts` | Create |
| `supabase/functions/send-password-reset/index.ts` | Create |
| `supabase/config.toml` | Update (add function configs) |
| `src/pages/Auth.tsx` | Update (add forgot password UI, welcome email call) |
| `src/pages/ResetPassword.tsx` | Create |
| `src/App.tsx` | Update (add reset-password route) |

---

### Secret Required
- **RESEND_API_KEY** - You'll need to provide this when we implement

