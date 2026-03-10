

## Changes

### 1. `src/components/ContactInformationStep.tsx`
- Change "Create Your Account" title to "Create Your Dashboard" (line 748)
- Remove the T&C's checkbox and legal documents dialog from this section (lines 766-871)
- Remove the "What Happens Next" section (lines 877-931)
- Remove the `legalDocumentsAccepted` validation checks (lines 326-330, 373-377) and the field from state/interface
- Clean up unused imports (Dialog, Checkbox, Info, CheckCircle2, Shield, etc. if no longer needed)

### 2. `src/components/dashboard/BookingDetailsDialog.tsx`
- Add the T&C's acceptance checkbox with the legal documents dialog **above** the "Make Payment by GoCardless" button (~line 599)
- Add state for `legalDocumentsAccepted`
- Disable the payment button until T&C's are accepted
- Include the same legal documents content (Terms & Conditions, Service Agreement, Data Protection)

### 3. Cleanup
- Remove `legalDocumentsAccepted` from the `ContactFormData` interface since it's no longer collected at signup
- The `legalDocumentsOpen` state and related dialog content moves to BookingDetailsDialog

