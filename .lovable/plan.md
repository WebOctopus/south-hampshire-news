

## Add Area Selection to Leafleting Quote Overview Popups

### Problem
The "Quote Details" popup for Leaflet Distribution quotes doesn't show the area cards (with location, circulation, postcodes) because the component only queries `pricing_areas`. Leafleting quotes store area IDs from the `leaflet_areas` table, so the lookup fails silently.

The PAYG quotes work fine because their area IDs come from `pricing_areas`.

### Fix

**File: `src/components/dashboard/ViewQuoteContent.tsx`**

1. **Import `useLeafletAreas`** from `@/hooks/useLeafletData`

2. **Fetch leaflet areas** alongside pricing areas:
   ```tsx
   const { data: leafletAreas = [] } = useLeafletAreas();
   ```

3. **Resolve leafleting areas separately**: When `quote.pricing_model === 'leafleting'`, filter `leafletAreas` by `quote.selected_area_ids` instead of `areas`. Map the leaflet area fields (`bimonthly_circulation` → display as circulation, `postcodes` as string) to match the AreaCard expectations.

4. **Update `selectedAreas`** to use the correct source:
   ```tsx
   const selectedAreas = quote.pricing_model === 'leafleting'
     ? leafletAreas.filter(a => quote.selected_area_ids?.includes(a.id))
         .map(a => ({ ...a, circulation: a.bimonthly_circulation }))
     : areas.filter(a => quote.selected_area_ids?.includes(a.id));
   ```

This ensures leafleting quote popups show the same area card format (name, circulation, postcodes) as PAYG quotes.

### Expected Result
Leaflet Distribution quote popups will show:
- Area 2 - CHANDLER'S FORD (11,300 circulation · SO53)
- Area 4 - HEDGE END & BOTLEY (9,400 circulation · SO30)

Matching the PAYG format visible in the second screenshot.

