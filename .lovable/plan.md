

## Fix: Quote Save Redirects to Wrong Tab (Race Condition)

### Root Cause

Two `useEffect` hooks conflict:

1. **Effect at line 236** — Detects `justSavedQuote` in localStorage, sets `activeTab('quotes')`, then **immediately removes** the flag from localStorage.
2. **Smart default effect at line 331** — Runs after data loads, checks localStorage for `justSavedQuote` — but it's already been removed by effect #1. Since `quotes` array is still empty (data hasn't loaded yet), it falls through to `setActiveTab('create-booking')`, overriding the correct tab.

### Fix

**File: `src/pages/Dashboard.tsx`**

In the first effect (line 259), after setting `activeTab('quotes')`, also mark the smart default as already applied so it won't override:

```tsx
if (isNewUserFromCalculator === 'true' || justSavedQuote === 'true') {
  setActiveTab('quotes');
  hasAppliedSmartDefault.current = true;  // ← ADD THIS LINE
  localStorage.removeItem('newUserFromCalculator');
  localStorage.removeItem('justSavedQuote');
```

Do the same for `justCreatedBooking` (line 275):

```tsx
if (justCreatedBooking === 'true') {
  setActiveTab('bookings');
  hasAppliedSmartDefault.current = true;  // ← ADD THIS LINE
  localStorage.removeItem('justCreatedBooking');
```

This prevents the smart default effect from overriding the tab that was already explicitly set by the localStorage flags.

### Files to change
- `src/pages/Dashboard.tsx` — add `hasAppliedSmartDefault.current = true` in both localStorage-driven tab selections

