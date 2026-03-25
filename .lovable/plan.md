

## Remove "Accounts & Support" from Booking Terms

**File: `src/components/dashboard/BookingTerms.tsx`**

Delete the entire "Accounts & Support" `AccordionItem` block (the one with `value="support"`, lines ~156-185) and remove it from the accordion's default `value` array. Also remove the `Phone` and `Mail` imports if no longer used elsewhere in the file.

