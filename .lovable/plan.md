

## Auto-Expand All Accordion Sections in Terms & Conditions Panel

### Problem
The Terms & Conditions panel uses `defaultValue` to set initial open state, but accordion sections may still require clicking to expand in some scenarios (e.g., re-renders, state resets).

### Fix
**File: `src/components/dashboard/BookingTerms.tsx`** (line 57)

Change the `Accordion` from uncontrolled (`defaultValue`) to controlled (`value` + `onValueChange`) so all sections are always forced open and cannot be collapsed:

```tsx
// Before:
<Accordion type="multiple" defaultValue={["terms", "fixed-terms", "payment", "support"]} className="space-y-3">

// After:
<Accordion type="multiple" value={["terms", "fixed-terms", "payment", "support"]} className="space-y-3">
```

Using `value` (controlled) instead of `defaultValue` (uncontrolled) means the sections are permanently open and the down-arrow click does nothing — the content is always visible.

Optionally, hide the chevron arrows on the `AccordionTrigger` elements since they're no longer functional, by adding a CSS class to hide the trigger's indicator icon.

### Files to change
- `src/components/dashboard/BookingTerms.tsx` — one-line change on line 57

