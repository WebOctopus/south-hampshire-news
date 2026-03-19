

## Fix Terms Acceptance Dialog — Two Issues

### 1. Accordion sections should be expanded by default
The `BookingTerms` component already sets `defaultValue={["terms", "payment", "support"]}` on the Accordion, but the "fixed-terms" value is missing from that array. When viewing a Pay As You Go quote, the fixed-terms accordion won't auto-open.

**Fix in `src/components/dashboard/BookingTerms.tsx`** (line 57):
Change `defaultValue` to include `"fixed-terms"`:
```tsx
<Accordion type="multiple" defaultValue={["terms", "fixed-terms", "payment", "support"]} ...>
```

### 2. Closing the dialog causes scroll jump (same bug as before)
The `TermsAcceptanceDialog` is missing the `onCloseAutoFocus` fix that was applied to the other dialogs.

**Fix in `src/components/dashboard/TermsAcceptanceDialog.tsx`** (line 53):
```tsx
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>
```

### 3. Bonus: Rename remaining "Fixed Term" labels to "Pay As You Go"
The `BookingTerms` component still shows "Fixed Term Booking Terms" and a "Fixed Term" badge (lines 93-96).

**Fix in `src/components/dashboard/BookingTerms.tsx`** (lines 93-96):
- Change heading to "Pay As You Go Booking Terms"
- Change badge to "Pay As You Go"

### Files
- `src/components/dashboard/BookingTerms.tsx` — expand all accordions by default + rename labels
- `src/components/dashboard/TermsAcceptanceDialog.tsx` — add `onCloseAutoFocus` fix

