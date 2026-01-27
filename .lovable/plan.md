
## Plan: Fix Password Reset "Invalid Link" Error

### Problem Analysis

Based on the auth logs and your screenshot, here's what's happening:

| Time | Event | Result |
|------|-------|--------|
| 16:00:38 | Reset link generated | Success |
| 16:03:22 | User clicked link, Supabase verified token | **Success** - user logged in |
| 16:03:54+ | Page tries to re-verify consumed token | **Fails** - "One-time token not found" |

**Root Cause**: When Supabase's `/verify` endpoint processes the recovery link, it:
1. Consumes the one-time token (single use)
2. Creates a session for the user
3. Redirects to `/reset-password` with hash parameters

However, the `ResetPassword.tsx` page then tries to call `setSession()` using those same hash parameters, which fails because the token was already consumed by the `/verify` endpoint.

### Current Flow (Broken)

```text
User clicks email link
    ↓
Supabase /verify endpoint (consumes token, creates session)
    ↓
Redirects to /reset-password#access_token=...&type=recovery
    ↓
ResetPassword.tsx tries setSession() with consumed token
    ↓
FAILS - shows "Invalid Reset Link" error
```

### Fixed Flow

```text
User clicks email link
    ↓
Supabase /verify endpoint (consumes token, creates session)
    ↓
Redirects to /reset-password#access_token=...&type=recovery
    ↓
ResetPassword.tsx checks for EXISTING SESSION first
    ↓
If session exists → show password form
If no session → THEN try to parse hash parameters
    ↓
SUCCESS - user can update password
```

---

### Solution

#### Modify `src/pages/ResetPassword.tsx`

**Change the session checking logic to:**

1. **First check if user already has a valid session** from the redirect
   - Supabase's client library auto-detects hash parameters and establishes session
   - If `supabase.auth.getSession()` returns a session, that's all we need

2. **Only attempt manual token parsing as a fallback**
   - This handles edge cases where auto-detection doesn't work

3. **Clear the URL hash after successful session detection**
   - Prevents re-parsing of consumed tokens on page refresh

4. **Don't show error toast immediately** - wait for session check to complete

**Updated Logic:**

```text
checkSession():
  1. First, call supabase.auth.getSession()
  2. If session exists:
     - Clear URL hash (remove consumed token from URL)
     - Set isValidSession = true
     - Return early (skip hash parsing)
  3. If no session, check URL hash parameters:
     - If type=recovery and access_token present, try setSession()
     - This is a fallback, likely won't be needed
  4. If still no session after all checks:
     - THEN show the "Invalid Link" UI (no toast)
```

**Remove the immediate toast errors** that fire during the checking phase - instead, just show the "Invalid Reset Link" card UI once checking is complete.

---

### Technical Changes

**File: `src/pages/ResetPassword.tsx`**

| Current Behavior | New Behavior |
|------------------|--------------|
| Tries `setSession()` with hash params first | Checks existing session first |
| Shows toast error during check | Only shows card UI after check fails |
| Keeps consumed token in URL | Clears URL hash after session confirmed |
| Calls `setSession()` even when session exists | Skips `setSession()` if session already exists |

**Key code change in `checkSession()` function:**
- Prioritize checking for existing session from `supabase.auth.getSession()`
- Clear the URL hash with `window.history.replaceState({}, '', window.location.pathname)` after success
- Remove the toast notifications during the checking phase
- The "Invalid Reset Link" card UI is sufficient feedback

---

### Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| First click on valid reset link | Error toast + Invalid Link card | Password form displays correctly |
| Refreshing page during reset | Error toast | Password form (if session valid) or clean invalid link card |
| Expired/used reset link | Toast flashes on home page | Clean "Invalid Reset Link" card on /reset-password |
| Successfully update password | Works | Works (no change) |

---

### File to Modify

| File | Changes |
|------|---------|
| `src/pages/ResetPassword.tsx` | Refactor `checkSession()` to prioritize existing session, remove toast errors during check, clear URL hash after session confirmed |
