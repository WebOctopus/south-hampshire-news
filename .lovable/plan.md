# Add a fourth case to the trigger test: admin acting through PostgREST

The functions have already been switched to SECURITY INVOKER. The remaining work is proving the guard behaves correctly on every path.

Case 3 in the existing test block runs as `postgres`, which only exercises the service-role branch of `is_privileged_writer`. It never proves that `has_role(auth.uid(), 'admin')` resolves under the `authenticated` role — the exact path the admin Featured toggle uses in the app. Confirmed that user `01f076a9-ffef-4b7a-8505-b3f5b84b0657` holds the admin role in `user_roles`.

## What to run

Re-run the self-reverting test block with a fourth case added before the final `RAISE EXCEPTION`: set the JWT claims to the admin user, switch to the `authenticated` role, attempt to set `featured = true`, capture the outcome in `r4`, then `RESET ROLE`.

The listing's real owner (`192665a0-...`) is also an admin, so case 1 keeps using the synthetic non-admin owner it already uses.

The whole block stays inside a single transaction that ends in a deliberate `RAISE EXCEPTION` carrying the four results, so every write is rolled back and no listing data changes.

## Expected results

```text
1 owner sets featured     -> blocked
2 owner sets description  -> ok
3 privileged (postgres)   -> ok
4 admin via authenticated -> ok
```

Any deviation — especially case 1 not blocking or case 4 blocking — means the guard is still wrong and gets fixed before this is called done.
