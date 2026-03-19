

## Fix: Payment Button Disabled Despite Terms Already Accepted

### Problem
The "Pay Full Amount by Card" button is disabled because `legalDocumentsAccepted` state is initialized via `useState(!!booking?.terms_accepted_at)`. Since `useState` only runs its initializer once (on mount), if the `booking` prop arrives or changes after the component mounts, the state stays `false` — even though `terms_accepted_at` is set on the booking.

### Fix
**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

Add a `useEffect` after line 33 to sync the state when the booking changes:

```tsx
useEffect(() => {
  if (booking?.terms_accepted_at) {
    setLegalDocumentsAccepted(true);
  }
}, [booking?.terms_accepted_at]);
```

This ensures that when the dialog opens with a booking that already has `terms_accepted_at` set (from the quote acceptance flow), the button is correctly enabled.

### Files Changed
- `src/components/dashboard/BookingDetailsDialog.tsx` — add useEffect to sync `legalDocumentsAccepted` with `booking.terms_accepted_at`

