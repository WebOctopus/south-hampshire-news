# Fix slug collisions in the directory import

Three batches failed with `duplicate key value violates unique constraint "businesses_slug_key"`.

Confirmed: `businesses` currently holds 2,394 rows, all with slugs. The commit step preloads every slug with a plain `.select("slug")`, which PostgREST caps at 1,000 rows — so the in-memory set was missing most existing slugs and the `-city` / `-2` suffix logic never saw the conflicts.

## What changes

**1. Bounded slug lookup per batch**

Replace the whole-table preload in the commit handler with a per-batch query:

- Compute the candidate base slug for every row in the batch that will be inserted (no existing `crm_company_id` match).
- Query only those: `.select("slug").in("slug", bases)`.
- Add a second query for existing suffixed variants: `.or(bases.map(s => \`slug.like.${s}-%\`).join(","))`, chunked so the filter string stays a sane length.
- Seed the in-memory set from both results, then run the existing suffix logic unchanged.

Work is bounded by batch size (100 rows per sub-chunk, 500 per batch), so it cannot truncate.

**2. Defensive retry on unique violation**

Wrap each upsert sub-chunk: if it fails with Postgres code `23505` mentioning `slug`, fall back to inserting that chunk row by row. For a row that hits `23505` on slug, bump to the next suffix (`-2`, `-3`, …, capped at ~20 attempts) and retry that single row. Only if the row still fails does it surface as an error — the batch is no longer lost because of one collision.

**3. Unchanged rules**

- Slugs are still generated on insert only; existing rows keep their slug forever.
- Owner-held field protection, area/keyword replacement, conflict recording and the deactivation guards are untouched.

## Re-running

Safe. The 2,394 rows already present match on `crm_company_id` and update without regenerating slugs; the remainder insert with correctly deduplicated slugs.

## Technical detail

File: `supabase/functions/import-directory-csv/index.ts`, inside `handleCommit`.

- Remove the `existingSlugs` preload block (`.from("businesses").select("slug").not("slug","is",null)`).
- Add `loadSlugPool(supabase, bases: string[]): Promise<Set<string>>` doing the `.in(...)` and `.like` prefix queries in chunks of 50 bases.
- Extract the candidate-slug logic into a small helper so the retry path can request "next suffix" for a given base.
- Split the current single `upsert(payload)` call into: try chunk upsert → on `23505` fall back to per-row upsert with slug regeneration.
- Redeploy the edge function.

## Audit of every `.select()` in the function for the 1,000-row cap

**1. Existing-listing lookup (`loadExistingByCrmId`)** — already bounded: it chunks the batch's own CRM ids and queries `.in("crm_company_id", chunk)` 200 at a time, so each response is at most 200 rows. No change needed beyond confirming the chunk size stays below 1,000. This is the lookup that decides insert vs update; the re-run's validate pass should report roughly "to add 1,465, to update 2,222". If it reports "to add 3,687, to update 0", this lookup is truncating and is the first thing to check.

**2. Deactivation sweep (`computeDeactivationSet`)** — currently `.select("id, name, crm_company_id").eq("is_active", true).eq("suppressed", false).limit(20000)`. A `.limit()` above the server's max-rows setting is silently clamped, so this can return 1,000 rows and both the volume guard percentage and the deactivation set would be computed against a truncated population. Replace with explicit paging: loop `.range(from, from + 999)` until a page returns fewer than 1,000 rows, accumulating all rows.

**3. Batch rows (`business_import_batches` by `import_run_id`)** — a full import is well under 1,000 batches at 500 rows per batch, but page it the same way for safety since it feeds the sweep's "seen" set. Same for the batch status query in `handleDeactivate`.

**4. Keyword lookups** — `.in("normalised_term", slice)` with slices of 200, and the conflict lookup `.in("business_id", ids)` bounded by batch size. Both safe; no change.

**5. Slug pool** — removed entirely and replaced by the bounded per-batch queries described above.

Add a small `selectAllPaged(query builder factory)` helper in the function so paged reads are consistent, and use it for items 2 and 3.
