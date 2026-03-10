

## Replace Boolean Toggle with Icon Picker for Feature Values

### Problem
The current "Boolean" toggle with a "Text/Bool" switcher is confusing for non-technical users. They don't understand what "Boolean" means or how it maps to ticks/crosses on the live cards.

### Solution
Replace the Boolean toggle with a clear **icon selector dropdown** showing visual options: ✓ Tick, ✗ Cross, or custom text. This makes it immediately obvious what will appear on the card.

### Changes

**File**: `src/components/admin/ProductDesignerManagement.tsx`

1. **Replace the Boolean/Text toggle pattern** (lines 360-390) with a single dropdown-based UI per feature:
   - A **Select dropdown** with three value modes:
     - "✓ Included" -- stores `true`, displays a tick on the card
     - "✗ Not included" -- stores `false`, displays a cross on the card  
     - "Custom text" -- shows a text input for freeform values (e.g. "From £99")
   - Remove the confusing "Bool" / "Text" toggle button entirely
   - Remove the "Boolean" label next to the switch

2. **The feature row layout becomes**:
   ```
   [Feature label input] [✓ Included ▼ dropdown] [Highlight toggle] [× remove]
   ```
   When "Custom text" is selected from the dropdown, a text input appears inline for the value.

3. **No data model changes** -- the `features` JSONB still stores `{ label, value: boolean | string, highlight }`. The dropdown simply provides a friendlier way to set the value.

### Files Changed

| File | Change |
|---|---|
| `src/components/admin/ProductDesignerManagement.tsx` | Replace Boolean switch + Text/Bool toggle with a Select dropdown offering "✓ Included", "✗ Not included", "Custom text" options |

