# Fix: admin_list_clients ambiguous `email` reference

## Problem

`supabase.rpc('admin_list_clients')` returns Postgres error `42702` — *column reference "email" is ambiguous* — so the Clients directory shows "No clients found" and a toast error.

Root cause is inside the function's `activity` CTE:

```sql
activity AS (
  SELECT email, max(ts) AS last_activity_at FROM (
    ...
  ) t GROUP BY email
)
```

The function is declared `RETURNS TABLE(email text, …)`, which makes `email` a PL/pgSQL OUT variable. The bare `email` in `SELECT email` and `GROUP BY email` collides with that variable.

## Fix

One migration that `CREATE OR REPLACE`s `admin_list_clients` with the two bare references qualified as `t.email`. Everything else in the function stays byte-for-byte identical — same signature, same STABLE SECURITY DEFINER, same search_path, same result columns, same body.

```sql
activity AS (
  SELECT t.email, max(t.ts) AS last_activity_at FROM (
    ...
  ) t GROUP BY t.email
)
```

No schema changes, no grants change, no client code change. After the migration the RPC returns rows and the Clients directory populates.

## Out of scope

- Any change to `admin_get_client`, `ClientsManagement.tsx`, or the dossier panel.
- Any refactor of the other CTEs (all already qualified).
