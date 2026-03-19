

## Fix: Email "Dashboard" Link Should Open Quotes Tab

### Problem
When a customer receives a booking confirmation email (for a saved quote), the "Go to Your Dashboard" link points to `/dashboard` with no parameters. The Dashboard defaults to the `bookings` tab (line 63), so the user sees an empty bookings list instead of their saved quote.

### Solution
Two changes:

**1. Support URL query parameter for tab selection (`src/pages/Dashboard.tsx`)**

Add logic in the existing `useEffect` (around line 235) to read a `?tab=quotes` query parameter from the URL and set the active tab accordingly:

```tsx
// Near the top of the useEffect that runs on mount
const urlParams = new URLSearchParams(window.location.search);
const tabParam = urlParams.get('tab');
if (tabParam && ['quotes', 'bookings', 'vouchers', 'create-booking', 'terms', 'listings', 'create', 'events', 'create-event', 'profile'].includes(tabParam)) {
  setActiveTab(tabParam);
}
```

This should run before the localStorage checks so localStorage flags can still override if present.

**2. Update email dashboard links (`supabase/functions/send-booking-confirmation-email/index.ts`)**

Update the "Go to Your Dashboard" link to include `?tab=quotes` when the email is for a quote (not a booking):

- Line ~263: Change the dashboard URL from `/dashboard` to `/dashboard?tab=quotes` when `isBooking` is false
- Line ~196 (existing user login link): Also append `?tab=quotes`

### Files to change
- `src/pages/Dashboard.tsx` — add URL query param tab handling
- `supabase/functions/send-booking-confirmation-email/index.ts` — append `?tab=quotes` to dashboard links for quote emails

