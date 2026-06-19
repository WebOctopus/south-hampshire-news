Add a read-only Reporting tab to the Discount Codes (Special Deals) admin area.

## Changes

1. **New component** `src/components/admin/DiscountCodesReporting.tsx`
   - Queries `discount_code_report` view via authenticated Supabase client.
   - Displays a table with columns: Code, Type, Status, Times Used, Total Booking Value (£), Total Discount Given (£), Last Used.
   - Status column shows "Expired" if `valid_until` has passed (regardless of `is_active`), else "Active" or "Inactive".
   - Currency values formatted to £0.00; `last_used_at` formatted as a readable date.
   - Read-only — no create/edit/delete actions.
   - Shows loading and empty states.

2. **Update** `src/components/admin/CostCalculatorManagement.tsx`
   - Import the new reporting component.
   - Add a "Reporting" tab next to "Discount Codes".
   - Increase `TabsList` grid columns from `grid-cols-6` to `grid-cols-7`.
   - Add `<BarChart3>` icon (or similar) for the new tab trigger.

## No database changes
The `discount_code_report` view already exists — only frontend code is required.

## No export feature needed
Table is read-only with no CSV/PDF export.