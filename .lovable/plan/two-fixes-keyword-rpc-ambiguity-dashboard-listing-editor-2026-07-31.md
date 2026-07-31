# Two fixes: keyword RPC ambiguity + dashboard listing editor

## 1. Fix `add_owner_business_keyword`

The function's `RETURNS TABLE(keyword_id uuid, term text, source text)` creates plpgsql
variables that collide with real column names in the `keywords` insert, the
`business_keywords` insert and the `ON CONFLICT (business_id, keyword_id)` clause —
hence "column reference keyword_id is ambiguous".

Migration: recreate the function with output columns renamed to `out_keyword_id`,
`out_term`, `out_source`. Body logic stays identical (permission check, 2–40 chars,
safe-character check on new terms only, business-name rejection, reuse of existing
normalised term, `created_by_owner` flag).

Callers: `BusinessKeywordsEditor` calls the RPC only for its side effect and reloads
from `business_keywords` afterwards, so no client change is needed; it will be
re-checked after the migration.

## 2. Advertiser dashboard listing editor

The third form lives inline in `src/pages/Dashboard.tsx` (`renderCreateBusinessForm`),
under Business Directory > Edit Listing. Changes:

- Remove the Category dropdown; drop `category_id` from the form state, the insert,
  the update, the edit prefill and the resets. Stop loading `business_categories`
  for the form.
- Relabel "Description" to "About".
- Add `BusinessKeywordsEditor` below the About field, in owner mode:
  `owner-verified` when the listing is verified, `owner-readonly` otherwise, and
  hidden while creating a new listing (no business id yet — the component already
  shows a "save first" message, which is fine to keep).

## 3. Sweep for other business edit forms

Confirmed three form surfaces exist today:
`src/components/admin/BusinessEditForm.tsx`, `src/components/dashboard/UserBusinessEditForm.tsx`,
and the inline form in `src/pages/Dashboard.tsx`. After the fix, re-scan for any other
component writing to `businesses` or referencing `category_id` and report anything found.

## Technical notes

- One migration; no schema changes, function replacement only.
- The `business_categories` table and the `businesses.category_id` column stay in place
  (no columns dropped); they are just no longer written from this form.
