## Fix: Verified & Recently Added rows missing on directory page

### What's wrong

Both `VerifiedBusinessesRow` and `RecentlyAddedRow` call Supabase RPCs (`get_verified_businesses`, `get_recently_added_businesses`) with just `{ limit_count: 6 }`. The DB now has **two overloads** of each function:

- `(limit_count int)`
- `(limit_count int, search_term text, category_filter uuid, edition_area_filter text, tag_filter text)` — all with defaults

Because both overloads accept the same call signature, PostgREST throws `42725: function ... is not unique` and returns no data. The components then `return null`, so the sections disappear silently.

### Fix

Create a migration that drops the older single-argument overloads, keeping the newer 5-argument versions (which still work when only `limit_count` is supplied because the rest default to NULL):

```sql
DROP FUNCTION IF EXISTS public.get_verified_businesses(integer);
DROP FUNCTION IF EXISTS public.get_recently_added_businesses(integer);
```

No client-side or component changes needed — once the duplicates are gone, the existing RPC calls resolve to the remaining overload and the rows render again.
