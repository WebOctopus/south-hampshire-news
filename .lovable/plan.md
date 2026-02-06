

## Plan: Target "Interactive Rate Card Calculator" Section Directly

### The Problem

Currently, the "Rate Card Calculator" menu item links to `/advertising#quick-quote`, which targets the entire QuickQuoteCalculator section. This section contains three components rendered in order:
1. **ROIFactorsInfo** - "The all important question" (current landing point)
2. **NewAdvertiserPromo** - BOGOF promo banner
3. **Interactive Rate Card Calculator** - The actual calculator card (desired landing point)

### Solution

Add a new anchor ID directly on the "Interactive Rate Card Calculator" Card component and update the navigation link to use this new anchor.

---

### Implementation Steps

#### 1. Add anchor to QuickQuoteCalculator.tsx

Add `id="rate-card-calculator"` to the Card component (line 132) that contains the "Interactive Rate Card Calculator" title:

```tsx
<Card id="rate-card-calculator" className="w-full border-0 shadow-none scroll-mt-20">
```

The `scroll-mt-20` class ensures the header clears the sticky navigation bar.

#### 2. Update Navigation.tsx

Change the "Rate Card Calculator" menu item href from `/advertising#quick-quote` to `/advertising#rate-card-calculator`.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/QuickQuoteCalculator.tsx` | Add `id="rate-card-calculator"` and `scroll-mt-20` to the Card component |
| `src/components/Navigation.tsx` | Update href to `/advertising#rate-card-calculator` |

