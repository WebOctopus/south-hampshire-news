# Skip rows tagged "Removed" in the CRM

Companies marked as gone in the CRM still reach the export (the export filter is inclusive, no exclude option). 41 rows in the current export carry a `Removed` tag. The importer should skip them and report them separately from rejections.

## Rule

- Split `Tags` on semicolons as today, trim each token.
- If any token equals `Removed` (case-insensitive, exact token equality — `Removed Listing` does not match), the row is **skipped as Removed**.
- Skipped-as-Removed rows are never inserted or updated, and their `crm_company_id` is not counted as present in the file.
- Because they count as absent, an existing active listing whose CRM record is now tagged `Removed` is picked up by the deactivation sweep on the next import and set inactive (suppressed listings stay untouched as today).

## Reporting

A new count in the validation report and the commit result: **"skipped — marked Removed in CRM"**, listed alongside (not inside) rejections and suppressed-skipped, with the row numbers and company names shown in the detail list.

## Technical detail

- `supabase/functions/import-directory-csv/parse.ts`: add `removedInCrm: boolean` to `ParsedRow`, set from the semicolon-split `Tags` tokens (`token.trim().toLowerCase() === "removed"`). Evaluated before the reject checks, so a Removed row is never also reported as a rejection.
- `supabase/functions/import-directory-csv/index.ts`:
  - Validate pass: partition parsed rows into removed / rejected / accepted; `crm_ids` recorded on the run excludes removed rows; add `removedSkipped` to the response.
  - Commit pass: same exclusion from `accepted` and from `crmIds`; add `removedSkipped` to the result counts.
- `src/components/admin/DirectoryImportManagement.tsx`: render the new count and its detail list in the validation report and the result summary.

No database or schema change. Deactivation guard logic (completeness, 20% volume threshold) is unchanged — Removed rows simply flow through it as absent CRM ids.
