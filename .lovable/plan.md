

## Show First 3 Magazine Editions in Hero Carousel

The magazine editions are already fetched from the database in `sort_order` (ascending), so admin ordering is respected. However, the carousel currently uses `align: "center"` which centers the first item — meaning with looping enabled, the last edition can appear to the left of item 1.

### Fix

**File: `src/pages/Index.tsx`** (line 68)

Change the carousel alignment from `"center"` to `"start"` so editions 1, 2, and 3 (as ordered in admin) are the first three visible covers when the page loads.

```tsx
// Before
opts={{ align: "center", loop: true }}

// After
opts={{ align: "start", loop: true }}
```

This single change ensures the carousel starts showing items in exact admin sort order — editions at positions 1, 2, 3 in the admin table will be the first three visible covers on the homepage.

