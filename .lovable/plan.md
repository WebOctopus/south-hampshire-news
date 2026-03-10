

## Remove Magazine Preview Toggle

### Change

In `src/components/AdvertisementSizeStep.tsx`:

1. **Remove the toggle section** (lines 435-456) — the "Advert Sizes" / "Magazine Preview" button group
2. **Remove the conditional rendering** (lines 458, 518-520) — always show the grid, remove the magazine preview branch
3. **Remove `previewMode` state** and `renderMagazinePreview` function since they're no longer needed
4. **Remove related imports** (e.g., `Eye` icon if only used for magazine preview)

The ad size grid will always display directly without any toggle.

