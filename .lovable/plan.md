

## Fix: Remove Misplaced "Start Month" Validation from Step 2

### Problem
The `selectedMonths` validation (line 1015-1022 in `AdvertisingStepForm.tsx`) sits inside the `currentStep === 1` bogof branch. Month selection happens on a later step (Step 3 — Duration/Schedule), so this check makes it impossible to leave Step 2.

### Change

**File: `src/components/AdvertisingStepForm.tsx`**

Remove lines 1015-1022 (the `selectedMonths` check) from the `currentStep === 1` bogof block. This validation already exists (or should exist) on the step where months are actually selected (Step 3 or later). The Step 2 bogof block should only validate:
1. At least one paid area selected
2. Free areas count matches paid areas count

That's it — one deletion of 8 lines.

