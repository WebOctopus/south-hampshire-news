# Fix the false pass in case 4, then re-run the trigger test

Case 3 sets `featured = true`. Case 4 then sets `featured = true` again, so `NEW IS DISTINCT FROM OLD` is false for every protected field, the trigger returns `NEW` without ever calling `is_privileged_writer`, and case 4 reports "ok" even if the admin path were entirely broken. It proves nothing as written.

## Change

Case 4 makes a real change instead:

```sql
UPDATE public.businesses SET featured = false WHERE id = v_biz;
...
r4 := 'admin via authenticated sets featured=false, rows=' || n;
```

Case 1 is genuine already: the listing starts at `featured = false` and case 1 runs first, so the owner setting it to `true` is a real transition and the trigger does compare fields. This will be confirmed by reading `featured` at the start of the block rather than assumed.

Everything else stays the same: one transaction, ending in a deliberate `RAISE EXCEPTION` carrying the results, so all writes roll back and no listing data changes.

## Expected results

```text
1 owner sets featured=true      -> blocked
2 owner sets description        -> ok
3 privileged (postgres)         -> ok, featured=true
4 admin via authenticated       -> ok, featured=false
```
