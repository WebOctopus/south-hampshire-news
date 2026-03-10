

## Add Area Selection to View Quote & Remove Edit Option

### Changes

**`src/pages/Dashboard.tsx`**:
1. Import `useAreas` from `usePricingData` to resolve area IDs to names/details
2. **Remove Edit button** from the quotes table (lines 1256-1262 — the Edit icon button)
3. **Remove Edit Quote dialog** (lines 1592-1627)
4. **Expand View Quote dialog** (lines 1517-1587) to include an "Area Selection" section:
   - For BOGOF quotes: show "Paid Areas" and "FREE Bonus Areas" sections using `bogof_paid_area_ids` and `bogof_free_area_ids`, mapped to area names/postcodes/circulation from `pricing_areas`
   - For Fixed Term quotes: show "Selected Areas" using `selected_area_ids`
   - For Leafleting quotes: show selected areas similarly
   - All displayed as read-only cards (no checkboxes, no interaction)

**`src/components/dashboard/QuoteConversionCard.tsx`**:
1. Remove the `onEdit` prop and the Edit button from the card actions
2. Clean up the `Edit` icon import

**Cleanup**: Remove `editingQuote`/`setEditingQuote` state and `EditQuoteForm` import from Dashboard since they're no longer needed.

