

## Remove Business Sector Field from Contact Information Form

**`src/components/ContactInformationStep.tsx`**:
- Remove the `businessSectors` array (lines ~165-200)
- Remove the conditional block (lines 598-631) that shows either "Charity Registration Number" or "Business Sector" — keep only the Charity Registration Number field, shown conditionally when `businessType === 'non_profit'`
- Remove the `companySector` references from `formData` if it's part of the initial state in this file

This is a straightforward removal — the field and its data array are only in this one file.

