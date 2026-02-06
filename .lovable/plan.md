

## Plan: Hide Prices from Advertisement Size Cards

### The Issue

On the Advertising page, the ad size selection cards display price badges like "From £45 - £90 + VAT" under each size. User feedback indicates this is confusing because:
- The prices shown don't account for the full context (number of areas, duration, etc.)
- Users see the detailed pricing breakdown elsewhere in the summary
- Having partial prices at this step creates confusion about final costs

### Solution

Remove the price Badge from the advertisement size cards, keeping only the visual size representation and dimensions.

---

### Implementation

**File to modify**: `src/components/AdvertisementSizeStep.tsx`

**Location**: Lines 141-167 in the `renderAdSizeVisual` function

**Change**: Remove the entire conditional block that renders the price Badge, leaving just the visual size box.

**Before** (current code):
```tsx
const renderAdSizeVisual = (size: any, isSelected: boolean) => {
  // ... dimension calculations ...
  
  return (
    <div className="flex flex-col items-center space-y-3">
      <div className={cn("border-2 border-dashed...")} ... >
        <span className="text-xs font-medium">{size.name}</span>
      </div>
      
      {/* This price badge will be removed */}
      {(pricingModel === 'bogof' && size.subscription_pricing_per_issue) || ... && (
        <Badge variant="outline" className="text-xs">
          {/* Complex pricing display logic */}
        </Badge>
      )}
    </div>
  );
};
```

**After** (simplified):
```tsx
const renderAdSizeVisual = (size: any, isSelected: boolean) => {
  // ... dimension calculations (unchanged) ...
  
  return (
    <div className="flex flex-col items-center space-y-3">
      <div className={cn("border-2 border-dashed...")} ... >
        <span className="text-xs font-medium">{size.name}</span>
      </div>
      {/* Price badge removed - pricing shown in summary */}
    </div>
  );
};
```

---

### Visual Result

**Before**: Each ad size card shows:
- Size name and dimensions
- Visual representation box
- Price badge: "From £45 - £90 + VAT"

**After**: Each ad size card shows:
- Size name and dimensions  
- Visual representation box
- *(No price - cleaner appearance)*

The full pricing breakdown continues to be displayed in the pricing summary section after selection.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/AdvertisementSizeStep.tsx` | Remove lines 141-167 (the price Badge rendering block) |

