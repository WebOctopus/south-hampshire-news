

## Add "Don't Miss Out" Nudge for Unused Free Areas in BOGOF

### Problem
When a user selects 2 paid areas in the 3+ Repeat Package (BOGOF), they're entitled to 2 free areas. If they only pick 1 free area, the form lets them proceed without any prompt — they're leaving a free area on the table.

### Solution
Add an alert/nudge in the Selection Summary area when `bogofFreeAreas.length < bogofPaidAreas.length` and at least 1 free area is selected. The message will encourage them to claim their remaining free areas.

### Changes

**File: `src/components/AreaSelectionStep.tsx`**

1. In the Selection Summary section (around line 428-463), add a conditional alert when `bogofPaidAreas.length > 0 && bogofFreeAreas.length < bogofPaidAreas.length`:
   - Show an amber/warning-style alert: *"Don't miss out! You've selected {bogofFreeAreas.length} of {bogofPaidAreas.length} free areas. Choose {remaining} more to maximise your coverage at no extra cost!"*
   - Use the existing `Alert` component with a gift/info icon.

2. The "Continue" button still works (no blocking) — this is a soft nudge, not a hard requirement.

### Single file change, ~10 lines added.

