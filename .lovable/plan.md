

## Plan: Update Fixed Term Summary Saving Text

### Overview

Change the savings message in the Fixed Term basket summary from "Total Saving" to "Book Online & Save 10%" to communicate that customers receive a 10% discount for booking online rather than in person.

---

### Implementation

**File to modify**: `src/components/FixedTermBasketSummary.tsx`

**Change**: Update the text inside the green savings box (line 256).

From:
```tsx
<p className="text-sm font-medium text-green-800">Total Saving</p>
```

To:
```tsx
<p className="text-sm font-medium text-green-800">Book Online & Save 10%</p>
```

---

### Result

The pricing summary section will display:

| Before | After |
|--------|-------|
| **Total Saving** | **Book Online & Save 10%** |
| £XXX.XX | £XXX.XX |

This makes it clear that the 10% discount shown is a benefit of booking through the online calculator rather than calling for an in-person quote.

