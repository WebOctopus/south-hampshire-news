## Goal

When a user lands on `/dashboard` for the first time after saving a quote or completing a booking, open the matching section (Saved Quotes or Bookings) instead of "Create Booking".

## Why it's happening today

`src/pages/Dashboard.tsx` has two parallel mechanisms:

1. **localStorage flag handler** (lines ~276–321) — reads `justSavedQuote` / `justCreatedBooking` / `pendingQuote` and switches tab.
2. **Smart-default handler** (lines ~355–381) — picks a tab based on whether `bookings`/`quotes` arrays have data, and locks the choice via `hasAppliedSmartDefault.current`.

Two race conditions cause the wrong tab to win:

- **Pending-quote signup flow**: when an unauthenticated user saves a quote, `pendingQuote` is stored, then on login `savePending()` (line 326) inserts it. The smart-default effect fires first while `quotes`/`bookings` are still empty (data not yet loaded), so it sets `create-booking` and locks the ref. By the time `savePending` resolves, the lock prevents recovery.
- **Loaded-state assumption**: smart-default treats `quotes.length === 0` / `bookings.length === 0` as "user has nothing", but at first render the loaders haven't returned yet — so a user with existing quotes still gets `create-booking` on a cold dashboard mount.

## Fix

All changes are in `src/pages/Dashboard.tsx`.

1. **Track loaded state**: add two refs/flags (e.g. `quotesLoaded`, `bookingsLoaded`) that flip true at the end of `loadQuotes` / `loadBookings`. Smart-default effect must early-return until both are true so it never decides based on empty initial arrays.

2. **Honour `pendingQuote` in the smart-default gate**: in the smart-default effect's "skip if a deliberate signal is present" check, also `return` when `localStorage.getItem('pendingQuote')` exists. This prevents the lock from being applied before `savePending` runs.

3. **Lock the ref in the pending-quote path**: inside `savePending()` (line 326+), set `hasAppliedSmartDefault.current = true` immediately before (or alongside) `setActiveTab('quotes')`, so a later smart-default pass cannot override it.

4. **Optional safety**: when a `justSavedQuote` / `justCreatedBooking` / `pendingQuote` signal is detected, set `hasAppliedSmartDefault.current = true` before any async loaders resolve (already done for the first two; just ensure ordering after the refactor).

Result: a user who saves a quote and then logs in lands on **Saved Quotes**; a user who completes a booking lands on **Bookings**; the smart default only kicks in once data has actually loaded and no explicit signal is present.

## Out of scope

- No changes to the calculator, booking creation, or webhook flows — they already set the correct localStorage flags.
- No sidebar/UI changes.
