

## Block Proceeding Without All Free Areas Selected (BOGOF)

### Problem
The `canProceed()` function only checks `bogofPaidAreas.length > 0` — it doesn't require free areas to match paid areas. Users can skip claiming free areas entirely.

### Changes

**File: `src/components/AreaSelectionStep.tsx`**

1. **Update `canProceed()`** (line 168-169): For BOGOF, require `bogofFreeAreas.length === bogofPaidAreas.length` (free must equal paid).

2. **Update the nudge alert** (line 438-442): Change from a soft nudge to a blocking message. Add a prompt to scroll back up and select free areas. Use stronger styling (e.g. destructive/red tone) and add a "Select Your Free Areas" button that scrolls to the free areas section.

3. **Move the "Continue" button logic**: It already depends on `canProceed()`, so updating that function automatically blocks progression.

4. **Add scroll-to-free-areas**: Add a `ref` on the free areas section heading, and a button in the alert that calls `scrollIntoView({ behavior: 'smooth' })` to bring users back to the free area cards.

### Result
- Users cannot proceed until all free areas are claimed
- Alert clearly states they must select free areas
- A button scrolls them back up to the free area selection

