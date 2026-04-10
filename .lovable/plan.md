

## Turn Area Field into a Dropdown of Distribution Areas

### Problem
The "Area / Town" field on the public event submission form is a free-text input, allowing submissions for areas outside the distribution coverage.

### Solution
Replace the text input with a `Select` dropdown populated from the `editionAreas` data (the same areas used across the site for editions/distribution). This restricts submissions to only areas you cover.

### Changes

**File: `src/pages/AddEvent.tsx`**
- Import `editionAreas` from `@/data/editionAreas`
- Import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from the UI library
- Replace the `<Input>` for "Area / Town" (lines 387-395) with a `<Select>` dropdown listing all edition area names
- Keep the field required

The 15 distribution areas (Southampton City Suburbs, Chandler's Ford, Fair Oak, Hedge End, Locks Heath, Fareham, Wickham, Winchester, Romsey, Totton, New Forest, Sholing, Hamble, Stockbridge, etc.) will appear as selectable options.

