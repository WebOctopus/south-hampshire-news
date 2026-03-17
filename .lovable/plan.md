
Goal: hard-block Step 2 in the live `/advertising#calculator` wizard until BOGOF has a valid paid/free pair count, and guide users back to free-area selection when invalid.

What I found (root cause):
1. The active flow is `AdvertisingStepForm` + `AreaAndScheduleStep` (not `AreaSelectionStep`).
2. Step transition validation (`AdvertisingStepForm` → `stepLabels.onStepTransition`) currently validates Step 2 only for `fixed` and `leafleting`, but not `bogof`.
3. `AreaAndScheduleStep` has a `canProceed()` function, but StepForm’s global Next button does not use it, so it cannot enforce blocking by itself.

Implementation plan:

1) Add hard validation for BOGOF when leaving Step 2  
File: `src/components/AdvertisingStepForm.tsx`
- In `onStepTransition`, inside `currentStep === 1`, add a `bogof` branch that blocks `nextStep()` unless:
  - `campaignData.bogofPaidAreas.length > 0`
  - `campaignData.bogofFreeAreas.length === campaignData.bogofPaidAreas.length`
- On failure:
  - show destructive toast with explicit copy like:  
    “You now need to click a free area before we can continue to the next step.”
  - auto-scroll back to the area selection section / free-area section.

2) Add stable scroll targets in Step 2 UI  
File: `src/components/AreaAndScheduleStep.tsx`
- Add IDs (or refs) to:
  - top of area selection block (e.g. `id="area-selection-section"`)
  - free areas column (e.g. `id="bogof-free-areas-section"`)
- This lets Step 2 validation reliably scroll users to the right place.

3) Show a clear inline blocking message in Step 2 summary  
File: `src/components/AreaAndScheduleStep.tsx`
- In the BOGOF selection summary, when paid/free counts are mismatched:
  - show a high-visibility blocking alert message (not soft nudge)
  - include remaining count (`paid - free`)
  - include “Select Your Free Areas” button that scrolls to free-area section.
- Keep messaging aligned with the toast so users get consistent instruction.

4) Keep behaviour consistent for all forward navigation paths  
File: `src/components/AdvertisingStepForm.tsx`
- Ensure this validation blocks both:
  - Bottom “Next” button
  - Progress-circle forward jumps (StepForm already routes forward jumps through `onStepTransition`).

Technical notes:
- No database/schema changes.
- No payment logic changes.
- This is a front-end validation + UX guidance fix in the active wizard path only.
- I will not rely on `AreaSelectionStep` for this fix since it is not the component currently driving this flow.

Validation checklist after implementation:
1. BOGOF with 1 paid + 0 free → cannot leave Step 2.
2. BOGOF with 2 paid + 1 free → cannot leave Step 2, sees explicit message, gets scrolled back.
3. BOGOF with 2 paid + 2 free → can proceed to Step 3.
4. Try clicking step circle directly to Step 3/4 with mismatch → still blocked.
5. Deselect paid area after selecting frees → free count re-validates and blocks until counts match again.
