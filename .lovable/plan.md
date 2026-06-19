## Goal
Add an admin UI to manage rows in the existing `discount_codes` table (list / create / edit / delete) inside the Cost Calculator Management console.

## Placement
`SpecialDealsManagement` isn't currently mounted in the admin console. I'll add a new **Discount Codes** tab to `src/components/admin/CostCalculatorManagement.tsx` (using a `Ticket`/`Tag` lucide icon), expanding the tab grid from 5 to 6 columns. The tab renders a new component, `DiscountCodesManagement`. (Existing `SpecialDealsManagement.tsx` is unrelated — it targets the `special_deals` table — and will be left untouched.)

## New component: `src/components/admin/DiscountCodesManagement.tsx`

### Data
- Direct calls to `supabase.from('discount_codes')` using the standard authenticated client. RLS already restricts to admins.
- Load on mount, ordered by `created_at desc`.
- TS row type derived locally (matches the columns listed by the user); no schema changes.

### List view
Card with a table:

| Column | Source |
| --- | --- |
| Code | `code` (mono font, uppercased display) |
| Type | Badge: Percentage / Fixed amount / Free item |
| Value | `discount_value%` for percentage, `£discount_value` for fixed, `free_item_text` for free item |
| Validity | `valid_from` – `valid_until` (formatted with `date-fns`, "—" when null) |
| Status | Badge: **Expired** if `valid_until` is in the past (overrides active); else **Active** when `is_active`, else **Inactive** |
| Actions | Edit, Delete buttons |

Header row has a primary **New discount code** button.

### Form (shadcn `Dialog` + `react-hook-form` + `zod`)
Fields, in order:
1. **Code** — text input, required, trimmed, uppercased on submit.
2. **Description** — textarea, optional.
3. **Deal type** — `Select`: Percentage / Fixed amount / Free item. Drives conditional fields.
4. **Value** — number input.
   - Percentage: suffix `%`, 0–100, step 1.
   - Fixed amount: prefix `£`, min 0, step 0.01.
   - Free item: hidden, value defaults to 0 on submit.
5. **Free item text** — text input, shown only when type is Free item; required in that case.
6. **Applies to** — three `Checkbox`es:
   - Subscription (`applies_to_subscription`)
   - Fixed-term (`applies_to_fixed_term`)
   - Leaflets (`applies_to_leaflets`)
   - All default to `true` for new records.
   - Zod refinement: at least one must be ticked.
7. **Single use per email** — `Switch` bound to `single_use_per_email`.
8. **Valid from** / **Valid until** — two shadcn date pickers (`Popover` + `Calendar`, `pointer-events-auto`). Both optional. Stored as ISO date strings.
9. **Active** — `Switch` bound to `is_active`, default `true`.

Submit:
- Create: `insert` then close, toast success, refresh list.
- Edit: `update` by id.
- Validation errors surfaced via `FormMessage`.

### Delete
Uses `AlertDialog` confirmation; on confirm, `supabase.from('discount_codes').delete().eq('id', id)`, then toast + refresh.

### Status helper
```ts
function getStatus(row) {
  if (row.valid_until && new Date(row.valid_until) < new Date()) return 'expired';
  return row.is_active ? 'active' : 'inactive';
}
```
Used for both the badge and (badge variant) colour.

## Files to add / edit
- **add** `src/components/admin/DiscountCodesManagement.tsx`
- **edit** `src/components/admin/CostCalculatorManagement.tsx` — import + new `TabsTrigger`/`TabsContent`, change `grid-cols-5` → `grid-cols-6`.

No DB changes, no edge function changes, no edits to `SpecialDealsManagement.tsx`.