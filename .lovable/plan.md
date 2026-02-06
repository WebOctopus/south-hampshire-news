

## Plan: Update Payment Display to Include VAT and Change Payment Timing

### Changes Required

Based on the screenshot from the dashboard, two updates are needed in the payment section:

1. **Add VAT to the displayed price** - Currently shows "£48.00", should show "£48.00 + VAT" (or calculate including VAT)
2. **Change payment timing from 3 days to 5 days** - The text currently says "1ST payment will be taken within the next 3 days"

---

### Implementation

**File to modify**: `src/components/dashboard/BookingDetailsDialog.tsx`

#### Change 1: Add "+ VAT" to the payment amount display (line 574)

**Before:**
```tsx
<span className="font-bold text-lg">
  {formatPrice(totalAmount)}
  {option.option_type === 'direct_debit' && <span className="text-sm text-muted-foreground">/month</span>}
</span>
```

**After:**
```tsx
<span className="font-bold text-lg">
  {formatPrice(totalAmount)} + VAT
  {option.option_type === 'direct_debit' && <span className="text-sm text-muted-foreground">/month</span>}
</span>
```

#### Change 2: Update payment timing from 3 days to 5 days (line 589)

**Before:**
```tsx
<p className="text-sm text-muted-foreground">
  • 1ST payment will be taken within the next 3 days. Subsequent payments on the 10th day of each month.
</p>
```

**After:**
```tsx
<p className="text-sm text-muted-foreground">
  • 1ST payment will be taken within the next 5 days. Subsequent payments on the 10th day of each month.
</p>
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/BookingDetailsDialog.tsx` | Add "+ VAT" to price display (line 574), change "3 days" to "5 days" (line 589) |

---

### Result

The payment section will display:
- **Monthly Direct Debit** £48.00 **+ VAT** /month
- 1ST payment will be taken within the next **5 days**

