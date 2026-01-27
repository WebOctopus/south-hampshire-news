
## Plan: Fix Password Reset Flow (Resend Only)

### Problem Summary
The password reset button is stuck on "Sending..." because:
1. The current code calls **both** Supabase Auth's built-in email AND the custom edge function
2. The edge function receives a generic URL without the actual reset token
3. The edge function invocation appears to be hanging on the custom domain

Since you want **Resend only**, we need to restructure the flow so that:
- Supabase generates the reset token but does NOT send its own email
- Our edge function receives the proper token and sends the branded email

### Solution Architecture

**Option A: Use Supabase Auth Hooks (Recommended)**
Configure Supabase to call our edge function as an Auth Hook when password reset is requested, replacing Supabase's default email entirely.

**Option B: Admin API Token Generation**
Have the edge function use the Supabase Admin API to generate the reset link, then send via Resend.

I recommend **Option B** as it gives us full control and doesn't require Supabase dashboard configuration.

---

### Implementation Steps

#### 1. Update Edge Function: `send-password-reset`

Modify the edge function to:
- Accept just the email address
- Use Supabase Admin API to generate a password reset link
- Send the branded email with the real reset link

```text
Changes:
- Import createClient from supabase-js
- Use SUPABASE_SERVICE_ROLE_KEY (already configured) to create admin client
- Call supabase.auth.admin.generateLink() to get the real reset URL
- Send email via Resend with the generated link
```

#### 2. Update Frontend: `Auth.tsx`

Simplify the `handleForgotPassword` function to:
- Remove the call to `supabase.auth.resetPasswordForEmail()`
- Only call the edge function with the email
- Add proper error handling and timeout
- Ensure loading state always resets

```text
Changes:
- Remove lines 209-220 (Supabase's resetPasswordForEmail call)
- Update edge function call to only send email
- Add fetch timeout to prevent infinite hanging
- Add explicit error handling for edge function failures
```

#### 3. Ensure SUPABASE_SERVICE_ROLE_KEY is Set

The edge function needs the service role key (already in secrets) to use the Admin API.

---

### Technical Details

**Edge Function Changes:**
```typescript
// New imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create admin client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Generate real reset link
const { data, error } = await supabaseAdmin.auth.admin.generateLink({
  type: "recovery",
  email: email,
  options: {
    redirectTo: `${siteUrl}/reset-password`
  }
});

// Use data.properties.action_link as the reset URL in the email
```

**Frontend Changes:**
```typescript
// Simplified handler
const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!forgotPasswordEmail) { /* validation */ }
  
  setForgotPasswordLoading(true);
  
  try {
    const { data, error } = await supabase.functions.invoke('send-password-reset', {
      body: { email: forgotPasswordEmail }
    });
    
    if (error) throw error;
    
    toast({ title: "Check your email", ... });
    setForgotPasswordOpen(false);
    setForgotPasswordEmail('');
  } catch (error) {
    toast({ title: "Error", ..., variant: "destructive" });
  } finally {
    setForgotPasswordLoading(false); // Always resets
  }
};
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/send-password-reset/index.ts` | Add Supabase Admin client, generate real reset link, simplify input to just email |
| `src/pages/Auth.tsx` | Remove Supabase's resetPasswordForEmail call, simplify to only use edge function |

---

### Benefits
- Single email from your verified domain (Resend only)
- Proper reset token in the link
- No hanging requests (proper error handling)
- Loading state always resets
