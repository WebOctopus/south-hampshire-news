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
