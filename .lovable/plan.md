

## Skip Terms Acceptance at Payment if Already Accepted

### Problem
When a user accepts terms via the quote "View & Accept Terms" flow, the booking is created with `terms_accepted_at` set. But when they then click "Make Payment by Card" in the booking dialog, they're asked to accept T&Cs again via a second checkbox — redundant and frustrating.

### Solution
In `BookingDetailsDialog.tsx`, check if `booking.terms_accepted_at` is already set. If so, auto-accept the legal documents checkbox (pre-check it and skip requiring interaction), or hide the T&Cs section entirely with a small note like "Terms accepted on [date]".

### Changes

**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

1. **Initialize `legalDocumentsAccepted` based on existing terms acceptance** (line 33):
   - Change from `useState(false)` to `useState(!!booking?.terms_accepted_at)`

2. **Conditionally render the T&Cs checkbox section** (lines 650-742):
   - If `booking.terms_accepted_at` exists: show a small green confirmation badge/note like "Terms accepted on [date]" instead of the checkbox + legal documents dialog
   - If not: show the existing checkbox flow as-is (for direct bookings that didn't go through quote flow)

3. **The payment button** (line 745) remains gated on `legalDocumentsAccepted` — since we pre-set it to `true` when terms were already accepted, no further changes needed there.

### Files
- `src/components/dashboard/BookingDetailsDialog.tsx`

