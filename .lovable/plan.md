

## Update BookingDetailsDialog for BOGOF Campaign Overview

**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

### Changes

1. **Line 305**: Change `'3+ Repeat Package Booking'` → `'3+ Subscription'`

2. **Line 427**: Change `Campaign Cost` label to `Monthly Cost` for BOGOF bookings. Wrap in a conditional: if `booking.pricing_model === 'bogof'`, show "Monthly Cost", otherwise keep "Campaign Cost".

3. **Line 502**: Change `'Paid Areas'` → `'Subscribed Areas'`

4. **Lines 528-531**: Update the count text from `paid area` to `subscribed area`

5. **Line 545**: Change `Bonus Free Areas 🎉` → `Bonus Free Areas for SIX months 🎉`

6. **Lines 548-554**: Display free areas on separate lines instead of comma-separated. Replace the `names.join(', ')` with individual area entries, each on its own line (using `<div>` elements per area name instead of joining).

### Technical detail

For change #6, replace the free areas rendering block:
```tsx
// Current: names.join(', ')
// New: map each free area to its own <div> line
const freeAreaIds = booking.bogof_free_area_ids || [];
if (!pricingAreas || freeAreaIds.length === 0) return 'No areas selected';
const freeAreas = freeAreaIds
  .map((id: string) => pricingAreas.find((a: any) => a.id === id))
  .filter(Boolean);
return freeAreas.map((area: any) => (
  <div key={area.id} className="text-sm text-green-800">{area.name}</div>
));
```

### Files to change
- `src/components/dashboard/BookingDetailsDialog.tsx`

