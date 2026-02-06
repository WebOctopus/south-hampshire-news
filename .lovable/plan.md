

## Plan: Remove "FREE DESIGN SERVICE" Sections

### Overview

Remove the "FREE DESIGN SERVICE" bullet point from the sales assistant popup tips that appear during the quote/booking process. This message appears in multiple places within the codebase.

---

### Locations to Modify

| File | Line(s) | Context |
|------|---------|---------|
| `src/components/SalesAssistantPopup.tsx` | Line 80 | BOGOF journey - step 5 tips |
| `src/components/SalesAssistantPopup.tsx` | Line 135 | Fixed Term journey - step 4 tips |
| `src/components/SalesAssistantPopup.tsx` | Line 191 | Leafleting journey - step 4 tips |
| `src/components/BookingSummaryStep.tsx` | Lines 769-773 | Booking summary info section |

---

### Changes

**Remove this tip from all three journey sections in SalesAssistantPopup.tsx:**
```
"🎨 FREE DESIGN SERVICE: By booking online you get free advert design. Our professional design team creates stunning ads at no extra cost - just provide your content, images, logo and branding kit if you have one."
```

**Remove this block from BookingSummaryStep.tsx:**
```tsx
<span className="text-primary font-medium">🎨</span>
<div>
  <p className="font-medium">FREE DESIGN SERVICE:</p>
  <p className="text-muted-foreground">By booking online you get free advert design...</p>
</div>
```

---

### Result

After removal, the booking summary and sales assistant tips will show:
- ✅ WHAT YOU'RE BOOKING
- ✅ INVESTMENT SHOWN
- ✅ IMMEDIATE CONFIRMATION
- ❌ ~~FREE DESIGN SERVICE~~ (removed)
- ✅ GUARANTEED REACH

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/SalesAssistantPopup.tsx` | Remove the FREE DESIGN SERVICE line from lines 80, 135, and 191 |
| `src/components/BookingSummaryStep.tsx` | Remove the FREE DESIGN SERVICE block (lines 769-773) |

