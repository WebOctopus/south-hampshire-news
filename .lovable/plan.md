

## Make BOGOF Area Selection Text Editable via "Edit Page"

### Problem
The BOGOF area selection section in `AreaAndScheduleStep.tsx` has hardcoded text that admins cannot change without code edits.

### Solution
Add a new `areaSelection` section to the `defaultAdvertisingContent` in `useAdvertisingContent.ts`, then wrap the relevant text elements in `EditableText` components in `AreaAndScheduleStep.tsx`.

### Changes

**File: `src/hooks/useAdvertisingContent.ts`**
- Add an `areaSelection` key to `defaultAdvertisingContent` with defaults for:
  - `bogofHeading`: "Select Areas for 3+ Repeat Package"
  - `bogofAlertTitle`: "3+ Repeat Package:"
  - `bogofAlertDescription`: 'For every "paid for" area, choose a "free for 3 issues" area. Select your paid areas first, then choose your free areas.'
  - `paidAreasHeading`: "Paid Areas"
  - `paidAreasDescription`: "These are the areas you will pay for throughout your campaign. Maximum 7 areas"
  - `freeAreasHeading`: "FREE Bonus Areas"
  - `freeAreasBadge`: "6 Months Free"
  - `freeAreasDescription`: "Select additional areas to receive for FREE for 6 months."

**File: `src/components/AreaAndScheduleStep.tsx`**
- Accept `advertisingContent` and `onContentSave` as optional props (passed from the parent step form which already has the content hook)
- Import `EditableText` and `useEditMode` from the inline editor
- Wrap each of the above text strings in `<EditableText>` components that read from `advertisingContent.areaSelection` and call `onContentSave` on change
- Non-admin users see plain text as before (EditableText renders normally when edit mode is off)

**File: `src/components/AdvertisingStepForm.tsx`** (or whichever parent passes props to AreaAndScheduleStep)
- Pass `advertisingContent` and the save mutation down to `AreaAndScheduleStep`

### Editable fields (visible in the screenshot)
1. Section heading ("Select Areas for 3+ Repeat Package")
2. Alert box text (the package description)
3. "Paid Areas" heading
4. Paid areas description text
5. "FREE Bonus Areas" heading
6. "6 Months Free" badge text
7. Free areas description text

