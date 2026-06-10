## Problem

Creating a Special Deal fails with `special_deals_deal_type_check`. The `special_deals.deal_type` column only accepts `'bogof' | 'percentage_discount' | 'fixed_discount'`, but the admin form submits `'percentage'` or `'fixed'`.

## Fix

In `src/components/admin/SubscriptionSettingsManagement.tsx`:

1. Update the Deal Type `<select>` (around line 945) to use the DB-valid values:
   - `percentage_discount` — "Percentage Off"
   - `fixed_discount` — "Fixed Amount Off"
2. Update the form's initial/reset state (lines ~110 and ~345) from `deal_type: 'percentage'` to `deal_type: 'percentage_discount'`.
3. Update conditional checks that compare against `'percentage'` (lines 957 and `SpecialDealsManagement.tsx` lines 1050/1054) to compare against `'percentage_discount'` so the `%` vs `£` label and table display stay correct.
4. Leave `SpecialDealsManagement.tsx` table read logic compatible with both old `'percentage'` rows (if any exist) and new `'percentage_discount'` rows by treating anything not equal to `'fixed_discount'`/`'fixed'` as percentage — or simply switch the equality check to `'percentage_discount'` since no rows currently exist with the broken value (the insert was rejected).

## Out of scope

No DB migration, no changes to BOGOF handling, pricing math, or other admin tabs.