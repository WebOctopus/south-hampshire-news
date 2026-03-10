

## Remove Right-Hand Action Button from Top Navigation

### Change

In `src/components/StepForm.tsx`, remove the right-side action buttons (Next Step / Save Quote / Book Now) from the **top** navigation bar only. Keep the Previous Step button and the step indicator. The bottom navigation remains unchanged with all buttons.

### File: `src/components/StepForm.tsx`

**Lines 192-249** (top navigation block): Replace the 3-column layout with just the Previous Step button and centered step indicator. Remove the entire right-side action buttons section (lines 212-247).

The layout changes from:
```
[< Previous Step]  [Step 2 of 5]  [Choose Ad Size >]
```
To:
```
[< Previous Step]  [Step 2 of 5]
```

