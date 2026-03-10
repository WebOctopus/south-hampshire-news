

## Differentiate Monthly vs Campaign Cost in Saved Quotes Table

### Problem
The "Monthly Cost" column header is misleading for leafleting quotes, which are a one-off campaign cost, not a recurring monthly charge.

### Changes

**`src/pages/Dashboard.tsx`**:

1. **Rename column header** from "Monthly Cost" to just "Cost" (line 1222)
2. **Add a descriptor below the price** in the cost cell (lines 1244-1246) based on `pricing_model`:
   - `bogof` → "per month"
   - `fixed` / `fixed_term` → "per month"  
   - `leafleting` → "campaign total"

The price cell will show:
```
£90.00
per month          (small muted text)
```
or
```
£782.10
campaign total     (small muted text)
```

This is a minimal change — just the column header and adding a `<span>` below the price value.

