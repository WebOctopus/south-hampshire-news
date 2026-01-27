

## Fix: Password Reset Blank Page

### Problem Identified

The `ResetPassword.tsx` component has a **React hooks violation** that causes a complete render failure (blank page). 

A `useEffect` hook on line 181 is placed *after* conditional `return` statements on lines 132-149 and 151-178. React requires all hooks to be called in the same order on every render - they cannot appear after early returns.

This is a JavaScript runtime error that silently crashes the component, resulting in the blank white page you're seeing.

### Solution

Move the countdown `useEffect` to the top of the component, alongside the other `useEffect` (session checking). Both hooks will run on every render, but their internal conditions will prevent them from executing their logic when not needed.

### Technical Changes

**File: `src/pages/ResetPassword.tsx`**

| Line | Change |
|------|--------|
| 181-190 | Remove the `useEffect` from its current position |
| After line 76 | Insert the countdown `useEffect` immediately after the session-checking `useEffect` |
| Update logic | Add guards inside the effect to only run when `isComplete` is true |

**Before (broken):**
```tsx
// Line 25-76: First useEffect ✓
useEffect(() => { checkSession(); }, []);

// Lines 132-149: if (checkingSession) return ...
// Lines 151-178: if (!isValidSession) return ...

// Line 180-190: Second useEffect AFTER returns ✗
useEffect(() => { /* countdown */ }, [isComplete, countdown, navigate]);
```

**After (fixed):**
```tsx
// Line 25-76: First useEffect ✓
useEffect(() => { checkSession(); }, []);

// Line 77-88: Second useEffect (moved here) ✓
useEffect(() => {
  if (isComplete && countdown > 0) {
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  } else if (isComplete && countdown === 0) {
    navigate('/dashboard');
  }
}, [isComplete, countdown, navigate]);

// Lines 90+: Conditional returns now safely AFTER all hooks
if (checkingSession) return ...
if (!isValidSession) return ...
```

### Expected Result

After this fix:
- The page will render correctly on the live site
- The "Verifying your reset link..." spinner will appear while checking
- Valid links will show the password form
- Invalid/expired links will show the error card
- After password update, the 5-second countdown and redirect will work

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ResetPassword.tsx` | Move countdown `useEffect` to before conditional returns |

