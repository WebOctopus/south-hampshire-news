

## Plan: Scroll to Campaign Duration on validation failure

### Problem
When users try to proceed without selecting a Campaign Duration, a toast error appears but the page doesn't scroll to the Campaign Duration field, so they may not see what needs fixing.

### Solution
Add a DOM id to the Campaign Duration section in `AreaAndScheduleStep.tsx`, then scroll to it when validation fails in `AdvertisingStepForm.tsx`.

### Changes

**File 1: `src/components/AreaAndScheduleStep.tsx`** (line 772)
- Add `id="campaign-duration-section"` to the Campaign Duration container div so it can be targeted by `scrollIntoView`.

**File 2: `src/components/AdvertisingStepForm.tsx`** (lines 260-265 and 285-290)
- After showing the toast for missing Campaign Duration (for both `leafleting` and `fixed` models), add:
  ```typescript
  document.getElementById('campaign-duration-section')?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
  ```
- This scrolls smoothly to the Campaign Duration dropdown, making it immediately visible alongside the red border and error message already in place.

### Summary
| File | Change |
|------|--------|
| `src/components/AreaAndScheduleStep.tsx` | Add `id="campaign-duration-section"` to duration div (line 772) |
| `src/components/AdvertisingStepForm.tsx` | Add `scrollIntoView` after both duration validation toasts (lines ~263 and ~288) |

Two small edits, no new dependencies.
