

## Plan: Fix Password Reset PKCE Code Exchange

### Root Cause

The password reset flow uses Supabase's PKCE authentication. When the user clicks the reset link:

1. Supabase's `/verify` endpoint consumes the one-time token
2. It redirects to `/reset-password?code=ABC123` (query parameter, not hash)
3. The app needs to call `exchangeCodeForSession(code)` to establish a session

**Current code only checks for hash parameters** (`#access_token=...`), missing the PKCE `?code=` query parameter entirely.

### Solution

Update `ResetPassword.tsx` to:

1. **Check for PKCE code in query params first** - Look for `?code=` before checking hash params
2. **Call `exchangeCodeForSession()`** - Exchange the code for a valid session
3. **Handle the exchange result** - If successful, show the password form; if failed, show error

### Technical Changes

**File: `src/pages/ResetPassword.tsx`**

Update the `checkSession()` function:

```typescript
const checkSession = async () => {
  try {
    // 1. First check for existing session (user already authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      window.history.replaceState({}, '', window.location.pathname);
      setIsValidSession(true);
      setCheckingSession(false);
      return;
    }

    // 2. Check for PKCE code in query params (Supabase PKCE flow)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      console.log('Found PKCE code, exchanging for session...');
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        // Clear URL params after successful exchange
        window.history.replaceState({}, '', window.location.pathname);
        setIsValidSession(true);
        setCheckingSession(false);
        return;
      } else {
        console.error('Error exchanging code for session:', error);
        setIsValidSession(false);
        setCheckingSession(false);
        return;
      }
    }

    // 3. Fallback: Check hash params (legacy flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (type === 'recovery' && accessToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      });
      
      if (!error) {
        window.history.replaceState({}, '', window.location.pathname);
        setIsValidSession(true);
      } else {
        console.error('Error setting recovery session:', error);
        setIsValidSession(false);
      }
    } else {
      // No session, no code, no hash params = invalid link
      setIsValidSession(false);
    }
  } catch (error) {
    console.error('Error checking session:', error);
    setIsValidSession(false);
  } finally {
    setCheckingSession(false);
  }
};
```

### Expected Flow After Fix

| Step | Before | After |
|------|--------|-------|
| User clicks email link | Goes to /verify | Goes to /verify (same) |
| Supabase verifies token | Redirects to /reset-password?code=... | Redirects to /reset-password?code=... (same) |
| ResetPassword loads | Checks only hash params (fails) | Checks query params, finds code |
| Code exchange | Never happens | Calls exchangeCodeForSession(code) |
| Session result | No session → "Invalid Link" | Session established → shows form |

### File to Modify

| File | Changes |
|------|---------|
| `src/pages/ResetPassword.tsx` | Add PKCE code detection and `exchangeCodeForSession()` call in `checkSession()` |

