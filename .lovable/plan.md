# Admin CSV import for the business directory

Replaces the current CSV Import tab with a two-phase importer: validate first, show a full report, then write only after explicit confirmation. Safe to re-run every time the CRM export refreshes.

## What the admin sees

1. **Upload** a Mirola CSV. Headers are matched by alias against the real export columns (see mapping below).
2. **Validation report** (nothing written yet):
   - Rows to insert / rows to update
   - Rows rejected, each with a reason (blank CRM company ID, no valid area left after discarding out-of-scope tokens)
   - Rows **partially resolved** — imported, but with one or more out-of-scope area tokens discarded, listed so you can see which listings lost an area
   - Rows **suppressed, skipped** — listings marked suppressed in the database, left completely untouched
   - Rows with no keywords — imported, but shown as a prominent warning count
   - New keyword terms that would be created
   - Listings that would be deactivated (in the database, absent from this file)
   - Owner-maintained fields the CRM wants to change (conflicts)
3. **Confirm import** button. Only this writes.
4. **Conflicts review** screen: for each owner-maintained field the CRM disagrees with, accept (writes the CRM value) or dismiss (leaves the listing alone).

## Column mapping (real Mirola export)

| CSV column | Business field |
| --- | --- |
| Name | name |
| Email | email |
| Phone Number | phone |
| Website | website |
| Address Line 1 | address_line1 |
| Address Line 2 | address_line2 |
| City | city |
| Postal Code | postcode |
| Logo URL | logo_url |
| Description (from LinkedIn) | description |
| Facebook Company Page | facebook_url |
| Instagram | instagram_url |
| Twitter | twitter_url |
| LinkedIn Company Page | linkedin_url |
| Directory keywords | primary keyword source (populated on ~92% of rows) |
| Local Edition (if present) | primary area source |
| Tags | fallback source for areas and keywords only — never stored |
| Notes | never read, never stored |

There is no `is_paying_advertiser` column. `crm_company_id` is not in the export yet — it is being added to Mirola, and until then every row is rejected for a blank ID. There is no name-matching fallback, ever.

### Areas

- If a `Local Edition` column is present and non-blank for a row, it is the area source (semicolon-split, each token resolved to an area code by number or internal name).
- Only when it is absent or blank does the importer fall back to `area <n>` tokens in `Tags`.
- Resolution is **per token, not per row**, for both sources. A token that does not resolve to area 1-14 ("area portsmouth", "area out of area") is discarded and counted; the row keeps whatever valid areas remain. "area 5; area portsmouth" imports as Area 5 and is reported as partially resolved. Only a row where *every* token is out of scope is rejected.

### Keywords

- `Directory keywords` is the primary source (semicolon-split).
- Only when a row has no `Directory keywords` value does the importer fall back to the `BIZ`/`BZ` tokens in `Tags`.

### Parsing `Tags`

`Tags` is semicolon-delimited. Tokens are classified case-insensitively:

- `area <n>` (e.g. "area 6", "area 13") -> area codes, used only as the fallback described above. "area out of area" and "area portsmouth" don't resolve to 1-14, so they are discarded per token and reported.
- `BIZ <term>` and `BZ <term>` -> fallback keyword `<term>` with `source = 'crm'` ("BIZ Driveways & Patios" -> "Driveways & Patios").
- `Sect HOSP` and `SectHOSP` (both spellings) -> sector tokens, ignored for now.
- Anything else is ignored.

`Tags` and `Notes` are never written to the business record in any form — they carry internal commercial language ("suspect", "budget", "AC Jamie"), the same exposure being removed from the `tag` column.

## Import rules

- Match strictly on `crm_company_id`. Never on name.
- Blank `crm_company_id`, or no area at all resolvable from `Local Edition` or `Tags` after discarding out-of-scope tokens → row rejected and reported. Areas are never guessed from the postcode.
- Multi-value fields split on `;` with surrounding whitespace trimmed; empty segments discarded. Commas are never delimiters — area and keyword values legitimately contain them.
- Unresolvable area tokens are discarded and counted; the row survives on its remaining valid areas and is reported as partially resolved.
- A business with `suppressed = true` is skipped entirely: not updated, `is_active` untouched, areas and keywords untouched. Counted as "suppressed, skipped". This protects businesses that have asked to be removed from the directory but still exist in the CRM.
- Areas replace that business's `business_areas` rows.
- Keywords write to `keywords` / `business_keywords` with `source = 'crm'`, deduplicated case-insensitively on the normalised term. Existing `source = 'owner'` rows are never touched, and only CRM rows are replaced. A row with no keyword material from either source is imported but counted in the prominent warning.
- `owner_id` and `is_verified` are never modified.
- Where `owner_id` is set, `description`, `phone`, `email`, `website`, `logo_url` and the social URLs are left as the owner has them. The incoming value is recorded as a conflict instead.
- No column is renamed or dropped.
- `featured` stays a manual admin toggle — the importer never sets or clears it.
- A `crm_company_id` in the database but not in the file gets `is_active = false`. Nothing is ever deleted.
- Slug is generated on insert only (`name` -> `name-city` -> `name-city-2`). Existing rows keep their slug forever so public URLs never break.

## Technical detail

**Migration**
- Add `businesses.suppressed boolean not null default false` — a manual admin flag meaning "never put this listing back up". The importer reads it and never writes it.
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
