

## Fix: Quote View Dialog Close Causes Page Jump

### Problem
Closing the "View Quote" dialog with the X button causes the page to jump to the bottom and spring back, despite `onCloseAutoFocus={(e) => e.preventDefault()}` already being in place.

### Root Cause
The `onCloseAutoFocus` fix alone may not be sufficient. Radix Dialog also fires `onPointerDownOutside` events and other focus-related behaviors that can trigger scroll jumps. Additionally, when `viewingQuote` is set to `null`, the re-render of the quote list can cause layout recalculation that shifts scroll position.

### Fix
**File: `src/pages/Dashboard.tsx`** (line 1511)

Add `onOpenAutoFocus` prevention alongside `onCloseAutoFocus`, and also prevent pointer-down-outside scroll side effects:

```tsx
// Before:
<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>

// After:
<DialogContent 
  className="max-w-2xl max-h-[80vh] overflow-y-auto" 
  onCloseAutoFocus={(e) => e.preventDefault()}
  onOpenAutoFocus={(e) => e.preventDefault()}
>
```

Also apply the same fix to the `BookingDetailsDialog.tsx` DialogContent elements (lines 326, 737, 901) which are missing `onCloseAutoFocus` entirely — these will have the same scroll jump issue:

```tsx
// Line 326:
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>

// Lines 737, 901 (nested legal docs dialogs):
<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>
```

### Files to change
- `src/pages/Dashboard.tsx` — add `onOpenAutoFocus` to quote view dialog
- `src/components/dashboard/BookingDetailsDialog.tsx` — add `onCloseAutoFocus` to 3 DialogContent elements

