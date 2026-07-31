# Import spec corrections: per-field delimiters and area source priority

Two changes to `supabase/functions/import-directory-csv/parse.ts`. Nothing else in the importer, the database, or the admin UI changes.

## 1. Keyword splitting becomes comma-first

`Directory keywords` is comma-delimited ("footcare, podiatry, podiatrist, chiropodist"), but the parser currently splits every list field on semicolons only, so a whole keyword string collapses into one keyword.

New behaviour for that field: split on commas **and** semicolons (a legacy value uses semicolons), trim each segment, drop empty segments so trailing commas are harmless, and dedupe case-insensitively within the row. The existing dedupe stays.

`Tags` and `Local Edition` keep semicolon-only splitting — their values contain commas internally ("Area 1 - Southampton City SO15,SO16,SO17") and comma-splitting would shred them.

The BIZ/BZ tag fallback for keywords still reads from `Tags`, so it stays semicolon-split, with the same comma-aware clean-up applied to each extracted term.

## 2. Tags becomes the primary area source

`Local Edition` holds one value per company, so it cannot express a business in two areas; 332 companies are genuinely multi-area, and `Tags` carries "area 5; area 13" correctly.

New order:
- Take area tokens from `Tags` (semicolon-split, tokens beginning "area").
- If `Tags` yields no *resolvable* area — either it has no "area" tokens, or every token it does have is discarded as out of scope (e.g. "area portsmouth") — fall back to `Local Edition`, extracting the leading number from the "Area <n> - <description>" prefix.
- Tokens with no number — "out of area", "Portsmouth", "Salisbury", "Bournemouth" — resolve to nothing and are discarded per-token by the existing rule. A row with no resolvable area is still rejected.

The rejection message is reworded to name the source actually used, so the report reads accurately.

## Technical notes

- Add `splitKeywordList` (splits on `[,;]`) next to the existing `splitList` (semicolon-only); use the new one for `Directory keywords`.
- In `parseRow`, resolve `tagTokens` filtered by `/^area\b/i` first; only when that resolution produces zero area codes read `Local Edition` via `splitList` and resolve those instead. Discarded tokens from both attempts are reported.
- `resolveAreaToken` already matches a leading "Area <n>" and returns `null` for numberless tokens, so it needs no change.
