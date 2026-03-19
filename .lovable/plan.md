

## Fix: Scroll Jump When Closing Quote View Dialog

### Problem
When closing the quote details dialog (and likely the delete dialog too), the page scroll jumps to the bottom. This happens because Radix Dialog restores focus to the trigger button when it closes, and the browser's native `scrollIntoView` behavior scrolls to that element — which may be far down the page (e.g., in the quotes table or the QuoteConversionCard).

### Fix
Add `onCloseAutoFocus={(e) => e.preventDefault()}` to the `DialogContent` components for both the quote view dialog and the delete quote dialog. This prevents Radix from triggering focus restoration (and the associated scroll jump) when the dialog closes.

### Files Changed
- **`src/pages/Dashboard.tsx`** — Add `onCloseAutoFocus` handler to `DialogContent` on the viewing quote dialog (~line 1511) and verify the `DeleteQuoteDialog` component handles this too
- **`src/components/dashboard/DeleteQuoteDialog.tsx`** — Add same `onCloseAutoFocus` handler if it uses `DialogContent`

### Technical Detail
```tsx
<DialogContent 
  className="max-w-2xl max-h-[80vh] overflow-y-auto"
  onCloseAutoFocus={(e) => e.preventDefault()}
>
```

