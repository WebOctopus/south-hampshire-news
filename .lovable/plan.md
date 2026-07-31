# Fix the admin-field protection trigger on listings

The trigger meant to stop a listing owner from editing admin-only fields has never blocked anything. Confirmed against the live database: both `businesses_protect_admin_fields` and `is_privileged_writer` are SECURITY DEFINER owned by `postgres`, so inside them `current_user` is always `postgres`, the first branch of `is_privileged_writer` returns true for every caller, and the trigger returns immediately without comparing any field.

## The fix

Recreate both functions as SECURITY INVOKER (the default), leaving their bodies otherwise unchanged. `current_user` then reflects the real caller:

```text
importer / edge function (service role)  -> current_user = service_role   -> allowed
admin via PostgREST                      -> authenticated + has_role admin -> allowed
listing owner via PostgREST              -> authenticated, not admin       -> BLOCKED
approve_business_claim / _removal        -> SECURITY DEFINER owned by postgres,
                                            so current_user = postgres     -> allowed
```

`has_role` stays SECURITY DEFINER, so the role lookup still works for a user who cannot read `user_roles` directly.

Protected fields stay as they are: `featured`, `is_verified`, `suppressed`, `is_active`, `owner_id`, `crm_company_id`.

## Verification (not optional)

The trigger has never fired, so it gets proven end to end before this is called done:

1. As a signed-in non-admin owner of a listing, run `supabase.from('businesses').update({ featured: true }).eq('id', <their listing>)` and confirm the update is rejected with the "Only an administrator can change ..." message and that `featured` is unchanged in the database afterwards.
2. Confirm the same owner can still update a normal field (for example `description`) on their own listing.
3. Confirm an admin can still change `featured`, and that `approve_business_claim` still sets `owner_id` and `is_verified` without tripping the trigger.

If the signed-in owner check cannot be run (no usable session), that will be stated plainly rather than reported as verified.

## Technical notes

- One migration: `CREATE OR REPLACE FUNCTION` for both functions without `SECURITY DEFINER`. No signature change, so the existing `BEFORE UPDATE` trigger on `businesses` keeps working and no application code changes.
- `SET search_path = public` is kept on both.
- No table, column, policy, or grant changes.
