# Set Featured Advertisers

A small admin action inside the Directory Import tab for managing the Featured tier, which is not part of the CRM export.

## How it works

1. Admin uploads a Mirola CSV (only the "Company ID" column is read; every other column is ignored) or pastes Company IDs, one per line.
2. A preview is generated — nothing is written yet — showing:
   - how many listings will become featured
   - how many will stop being featured, with their names listed
   - Company IDs that match a listing which is switched off (inactive), so it cannot be featured — listed separately with their names
   - Company IDs that match no listing at all, listed (never imported, almost certainly rejected for having no in-scope area)
   - how many are already featured with no change
3. If the file would unfeature more than 50% of currently featured listings, a prominent warning appears before confirmation is allowed.
4. On explicit confirm, the list is applied declaratively: `featured = true` for active listings whose CRM company ID is in the list, `featured = false` for every other business.

Because the list is the complete set rather than an addition, an advertiser who stops paying drops out of the Featured tier on the next upload.

## Technical notes

- New modes `featured-preview` and `featured-apply` added to the existing `import-directory-csv` edge function, reusing its admin check (JWT plus `user_roles` admin lookup) and service-role client. No new table, no anon access.
- Body: `{ mode, crmIds: string[] }`. The client parses the CSV or pasted text and sends the deduped, trimmed, non-empty Company ID list.
- Preview reads use the existing `selectAllPaged` helper so nothing truncates at the 1,000-row PostgREST cap:
  - all currently `featured = true` businesses (id, name, crm_company_id)
  - matching businesses for the submitted IDs regardless of `is_active`, chunked with `.in()` at 200 IDs per request, then split into three buckets: matched-and-active (will be featured), matched-but-inactive (reported, never written), and unmatched IDs
- Apply performs exactly two updates, both touching only the `featured` column:
  - `featured = true` where `crm_company_id` is in the list and `is_active = true`, chunked
  - `featured = false` for every currently featured listing not in that set, chunked by id
  Nothing else is modified — `is_verified`, `owner_id`, `suppressed`, `is_active`, areas and keywords are untouched.
- The >50% unfeature guard is computed server-side in the preview and re-checked on apply; apply refuses unless the client passes `force: true` after the admin acknowledges the warning.
- UI: a new `FeaturedAdvertisersImport` card rendered inside `src/components/admin/DirectoryImportManagement.tsx`, with a file picker, a textarea for pasted IDs, preview stats, the unmatched-ID and losing-featured lists, and a confirm button, following the existing card/stat/table patterns in that file.