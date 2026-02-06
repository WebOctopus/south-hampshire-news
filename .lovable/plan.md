

## Plan: Add "Book Online & Save 10%" to Booking Summary Card

### The Issue

The "Book Online & Save 10%" message currently only appears in the **Pricing Summary** section (right column) inside a green box. The user wants this message to also appear in the **Booking Summary** card (left column), directly under the Duration field, so it's immediately visible when reviewing the booking details.

### Solution

Add a styled "Book Online & Save 10%" badge/message directly under the Duration field in the Booking Summary card.

---

### Implementation

**File to modify**: `src/components/FixedTermBasketSummary.tsx`

**Location**: After line 117 (under the Duration field display)

**Add the following** under the Duration value:

```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label className="text-sm font-medium text-muted-foreground">Advert Size</Label>
    <p className="font-medium">{getAdSizeName()}</p>
  </div>
  <div>
    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
    <p className="font-medium">{getDurationName()}</p>
    {/* NEW: Add online discount message */}
    <p className="text-xs text-green-600 font-medium mt-1">Book Online & Save 10%</p>
  </div>
</div>
```

---

### Visual Result

The Booking Summary card will display:

| Advert Size | Duration |
|-------------|----------|
| 1/2 Page Portrait | 2 Issues = 4 months |
| | **Book Online & Save 10%** |

The message will appear in green text, making it stand out as a promotional benefit.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/FixedTermBasketSummary.tsx` | Add green "Book Online & Save 10%" text under Duration field (after line 117) |

