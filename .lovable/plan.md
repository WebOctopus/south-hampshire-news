# Fix: 172 rows skipped on import

## Root cause
The edge function `import-businesses-csv` reads `row["Company name"]` with an exact key match. Your CSV uses `Name` as the header, so every row is treated as "no company name" and skipped (matching the screenshot: 172 Skipped, 0 Imported).

## Fix approach
Make header lookup tolerant and accept aliases for every supported field, in both the edge function and the client-side CSV parser/preview.

### Header normalisation
Normalise keys when reading each row: `lowercase`, trim, strip BOM, collapse whitespace and punctuation to a single space. Look up values by normalised key.

### Accepted aliases per field
- **name** (required): `name`, `company name`, `company`, `business name`, `business`, `trading name`
- **address_line1**: `street address`, `address`, `address 1`, `address line 1`
- **address_line2**: combine `street address 2` / `address 2` / `address line 2` + `street address 3` / `address 3` / `address line 3`
- **postcode**: `postal code`, `postcode`, `post code`, `zip`, `zip code`
- **city**: `city`, `town`
- **website**: `company domain name`, `website`, `domain`, `url`
- **phone**: `phone number`, `phone`, `telephone`, `tel`, `mobile`
- **email**: `company email`, `email`, `email address`
- **sector**: `sector`, `industry`, `category`
- **biz_type**: `biz type`, `business type`, `type`
- **edition_area**: `14 editions - local`, `14 editions local`, `edition`, `edition area`, `local edition`, `area`
- **tag**: `tag`, `tags`, `label`

## Files to change
1. **`supabase/functions/import-businesses-csv/index.ts`**
   - Add `normaliseKey()` and `pickField(row, aliases[])` helpers.
   - Build a normalised-key map for each row once, then resolve every field through the alias list above.
   - Replace all `row["Exact Header"]` lookups.

2. **`src/components/admin/CSVImportManagement.tsx`**
   - Apply the same alias/normalisation logic in the client preview + field-detection UI (the green/red tick column), so the preview reflects what the edge function will actually use.
   - Keep the existing template download unchanged (still shows canonical headers).

## Out of scope
- No DB schema changes.
- No change to slug generation, replace-all behaviour, or export.
- Template CSV keeps current canonical headers; only the importer becomes tolerant.

## Validation
After deploy, re-run the same 172-row import with `Name` header. Expect Imported = 172 (minus any genuinely blank rows), Skipped = 0.
