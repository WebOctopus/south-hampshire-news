# Admin CSV import for the business directory

Replaces the current CSV Import tab with a two-phase importer: validate first, show a full report, then write only after explicit confirmation. Safe to re-run every time the CRM export refreshes.

## What the admin sees

1. **Upload** a CRM CSV. Headers are matched by alias, so the real CRM column names work as-is ("Company Name", "Company Domain Name", "Phone Number", "Postal Code", "Street Address 1-3", "City", "14 Editions - Local", etc.).
2. **Validation report** (nothing written yet):
   - Rows to insert / rows to update
   - Rows rejected, each with a reason (blank CRM company ID, empty areas, area outside 1-14)
   - Rows with no keywords — imported, but shown as a prominent warning count
   - New keyword terms that would be created
   - Listings that would be deactivated (in the database, absent from this file)
   - Owner-maintained fields the CRM wants to change (conflicts)
3. **Confirm import** button. Only this writes.
4. **Conflicts review** screen: for each owner-maintained field the CRM disagrees with, accept (writes the CRM value) or dismiss (leaves the listing alone).

## Import rules

- Match strictly on `crm_company_id`. Never on name.
- Blank `crm_company_id` or empty `areas` → row rejected and reported. Areas are never guessed from the postcode.
- `areas` and `keywords` split on `;` with surrounding whitespace trimmed; empty segments discarded. Commas are never delimiters — area and keyword values legitimately contain them.
- Each area token resolves to a `directory_areas` row by area number or by internal name (case-insensitive). Anything that doesn't resolve to area 1-14 → row skipped and reported.
- Areas replace that business's `business_areas` rows.
- Keywords write to `keywords` / `business_keywords` with `source = 'crm'`, deduplicated case-insensitively on the normalised term. Existing `source = 'owner'` rows are never touched, and only CRM rows are replaced.
- `owner_id` and `is_verified` are never modified.
- Where `owner_id` is set, `description` (from `about`), `phone`, `email`, `website`, `logo_url` and the six social URLs are left as the owner has them. The incoming value is recorded as a conflict instead.
- `about` maps to the existing `description` column. No column is renamed.
- `is_paying_advertiser` sets `businesses.featured`.
- A `crm_company_id` in the database but not in the file gets `is_active = false`. Nothing is ever deleted.
- Slug is generated on insert only (`name` -> `name-city` -> `name-city-2`). Existing rows keep their slug forever so public URLs never break.

## Technical detail

**Migration**
- New table `public.business_import_conflicts`: `id`, `business_id` (fk, cascade), `field_name`, `crm_value`, `current_value`, `import_run_id uuid`, `status text default 'pending'` (check: pending/accepted/dismissed), `resolved_at`, `resolved_by`, `created_at`, `updated_at`. Partial unique index on `(business_id, field_name)` where `status = 'pending'` so re-imports update the pending row rather than piling up duplicates. A dismissed conflict whose CRM value later differs becomes a new pending row; an unchanged value stays dismissed.
- Grants: `authenticated` (admin policies gate it) and `service_role` only. No `anon`. RLS on, admin-only via `has_role(auth.uid(),'admin')`.

**Edge function `import-directory-csv`** (replaces `import-businesses-csv`, which is deleted along with its wipe-everything logic)
- Verifies caller is an admin, then uses the service-role client.
- Two modes on the same endpoint: `mode: 'validate'` (pure analysis, no writes) and `mode: 'commit'` (writes, keyed to an `import_run_id` issued by the validate pass).
- Client sends 500-row batches; server processes in 100-row sub-batches, as today.
- Commit pass per row: upsert `businesses` on `crm_company_id`; replace `business_areas`; upsert keyword terms and replace only `source = 'crm'` links; record conflicts for owner-held fields. Deactivation sweep runs on the final batch against the full set of CRM ids seen.

**Front end**
- `src/components/admin/DirectoryImportManagement.tsx` replaces `CSVImportManagement.tsx` in the existing admin tab: upload, validation report, confirm, progress, result summary.
- `src/components/admin/ImportConflictsPanel.tsx` for the accept/dismiss review list.
- CSV parsing, header aliasing and slug generation carried over from the existing importer.

Nothing reads `businesses`, `business_areas`, `business_keywords` or `directory_areas` from a public page — this is admin-only and runs service-role server-side. `pricing_areas` and `leaflet_areas` are untouched.
