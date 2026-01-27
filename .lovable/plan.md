

## Plan: Fix Sign-Out Navigation to Ensure Immediate Home Page Redirect

### Root Cause

The sign-out functionality isn't working smoothly because:

1. **`DashboardHeader.tsx` bypasses the centralized auth system** - It calls `supabase.auth.signOut()` directly and attempts its own navigation, instead of using `signOut()` from `useAuth()`

2. **Navigation inside `onAuthStateChange` may not work reliably** - React Router's `navigate()` called from within an async callback can sometimes fail to trigger a proper re-render

3. **No forced navigation on sign-out** - When the user is on `/dashboard` and clicks sign-out, the app relies on `navigate('/')` which may not fully reload the page state

---

### Solution

#### Step 1: Update DashboardHeader to Use Centralized Auth

**File: `src/components/dashboard/DashboardHeader.tsx`**

| Current (Broken) | New (Fixed) |
|------------------|-------------|
| Imports `supabase` directly | Imports `useAuth` hook |
| Calls `supabase.auth.signOut()` | Calls `signOut()` from context |
| Uses local `navigate("/")` | Lets context handle navigation |

Changes:
- Import `useAuth` from `@/contexts/AuthContext`
- Remove direct `supabase` import
- Call `signOut()` from the context instead of `supabase.auth.signOut()`

#### Step 2: Strengthen Navigation in AuthContext

**File: `src/contexts/AuthContext.tsx`**

Ensure the sign-out navigation is robust by:
- Using `window.location.href = '/'` as a fallback if `navigate('/')` doesn't work
- Adding explicit navigation in the `signOut` function itself (not just relying on `onAuthStateChange`)

Changes to `signOut` function:
```text
Current:
  await supabase.auth.signOut();
  // Navigation is handled by onAuthStateChange

New:
  await supabase.auth.signOut();
  // Explicitly navigate to home
  navigate('/');
```

Changes to `onAuthStateChange`:
```text
Current:
  if (event === 'SIGNED_OUT') {
    setIsAdmin(false);
    navigate('/');
  }

New:
  if (event === 'SIGNED_OUT') {
    setIsAdmin(false);
    // Force navigation with window.location as fallback
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }, 100);
  }
```

---

### Technical Details

#### Why `window.location.href` as fallback?

React Router's `navigate()` performs a client-side navigation that may:
- Not trigger if the component unmounts during the async operation
- Not properly clear stale state from the previous authenticated session
- Fail silently in edge cases

Using `window.location.href = '/'` ensures:
- A full page reload that clears all React state
- The auth context reinitializes with no user
- The Navigation component re-renders showing the logged-out state

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardHeader.tsx` | Use `useAuth().signOut()` instead of direct Supabase call |
| `src/contexts/AuthContext.tsx` | Add explicit navigation in `signOut()` function, add `window.location.href` fallback |

---

### Expected Behavior After Fix

| Action | Before | After |
|--------|--------|-------|
| Click "Sign Out" in Dashboard | Stays on dashboard, URL doesn't change | Immediately navigates to home page |
| Navigation updates | User has to manually reload | Navigation component shows "Customer Login" button |
| Session state | May retain stale data | Fully cleared, fresh home page |

---

### Testing Steps

After implementation:
1. Log in to the dashboard
2. Click on user avatar → "Sign Out"
3. **Expected**: Immediately redirected to home page with "Customer Login" button visible
4. Try navigating to `/dashboard` - should redirect to `/auth` since not authenticated

