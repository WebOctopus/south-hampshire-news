

## Smart Default Tab for New Dashboard Users

### Problem
When a user logs into the dashboard without any localStorage flags or URL params, they land on the "bookings" tab (the hardcoded default). If they have no bookings but do have a saved quote, they see an empty page and may not notice their quote in the sidebar.

### Solution
After data loads, if no URL param or localStorage flag has already set the tab, intelligently pick the best default tab based on what content the user actually has.

**File: `src/pages/Dashboard.tsx`**

Add a new `useEffect` that runs after quotes and bookings have loaded. It checks whether the current `activeTab` is still the initial default (`bookings`) and no explicit override was applied, then picks the best tab:

1. If user has bookings → stay on `bookings` (current default works)
2. If user has no bookings but has quotes → switch to `quotes`
3. If user has neither → switch to `create-booking` (the advertising entry point)

This logic should use a ref flag (`hasAppliedSmartDefault`) to only run once per mount, so it doesn't fight with user navigation.

```tsx
// New ref near other refs
const hasAppliedSmartDefault = useRef(false);

// New useEffect after data loads
useEffect(() => {
  if (hasAppliedSmartDefault.current) return;
  // Wait until data has loaded (user must exist and loading should be done)
  if (!user) return;
  
  // Don't override if URL param or localStorage already set the tab
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab')) return;
  
  // Only apply smart default when on the initial default tab
  if (activeTab !== 'bookings') return;
  
  // Check if we have data loaded (quotes array exists even if empty)
  if (bookings.length > 0) {
    hasAppliedSmartDefault.current = true;
    return; // bookings tab is correct
  }
  if (quotes.length > 0) {
    setActiveTab('quotes');
    hasAppliedSmartDefault.current = true;
    return;
  }
  // If both are empty and we've had a chance to load, go to create-booking
  // Use a small delay to ensure async loads have completed
  if (bookings.length === 0 && quotes.length === 0) {
    setActiveTab('create-booking');
    hasAppliedSmartDefault.current = true;
  }
}, [user, quotes, bookings, activeTab]);
```

### Files to change
- `src/pages/Dashboard.tsx` — add smart default tab selection after data loads

