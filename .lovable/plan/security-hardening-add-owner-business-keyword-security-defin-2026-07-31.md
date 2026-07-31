# Security hardening: add_owner_business_keyword + SECURITY DEFINER audit

## What is wrong today (verified against the live database)

`add_owner_business_keyword(uuid, text)` currently:

- Grants EXECUTE to `anon` (its ACL includes `anon=X`, inherited from the default public grant). An unauthenticated caller can invoke it.
- Guards ownership with `IF NOT v_is_admin AND NOT (v_business.owner_id = auth.uid() AND v_business.is_verified)`. With `auth.uid()` NULL on a verified listing the inner expression is NULL, `NOT NULL` is NULL, and plpgsql treats a NULL `IF` as false — so the exception never fires and an anonymous caller could write into the shared `keywords` list. No listing is verified yet, so there is no live exposure; the claim flow changes that.

## Fix (single migration)

1. Recreate `add_owner_business_keyword` with:
   - `IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;` as the first statement of the body.
   - A NULL-safe ownership test:
     `IF NOT v_is_admin AND NOT (v_business.owner_id IS NOT DISTINCT FROM auth.uid() AND coalesce(v_business.is_verified, false)) THEN`
   - Everything else unchanged: `out_keyword_id` / `out_term` / `out_source` output names, 2-40 character rule, safe-character check on new terms only, business-name rejection, reuse of an existing normalised term, `created_by_owner` flag, and the 2-keyword owner cap enforced by the trigger.
2. `REVOKE EXECUTE ON FUNCTION public.add_owner_business_keyword(uuid, text) FROM anon;` plus a revoke from `PUBLIC` so the grant cannot reappear through the default role. EXECUTE stays for `authenticated` and `service_role`.
3. Revoke `anon` (and `PUBLIC`) EXECUTE from `directory_business_keywords(uuid)` and `directory_business_postcodes(uuid)`. A codebase search finds no caller outside the generated `src/integrations/supabase/types.ts` — they are only used internally by the v2 detail/search functions, which run as their own definer and are unaffected by the revoke. Neither helper checks `is_active` or `suppressed`, so they should not be publicly callable.

No frontend change is needed — `BusinessKeywordsEditor` only calls the RPC for signed-in users and already surfaces the raised message.

## Audit of the other SECURITY DEFINER functions from this project

Checked ACLs and bodies for all of them:

| Function | anon EXECUTE | Verdict |
| --- | --- | --- |
| `get_directory_postcodes`, `suggest_directory_keywords`, `get_public_businesses_v2`, `get_public_businesses_count_v2`, `get_verified_businesses_v2`, `get_recently_added_businesses_v2`, `get_business_detail_v2`, `get_business_detail_by_slug_v2` | yes | Correct — these are the public directory read path and contain no `auth.uid()` comparison. |
| `directory_business_keywords`, `directory_business_postcodes` | yes | Internal helpers only, no visibility filtering — revoke `anon`. |
| `admin_list_owner_keywords`, `get_users_for_owner_assignment` | already revoked | Correct. Both gate on `has_role(auth.uid(), 'admin')`, which returns false (not NULL) for a NULL uid, so they fail closed. |
| `add_owner_business_keyword` | yes | Broken — fixed above. |

`add_owner_business_keyword` is the only function in this set that compares `owner_id` to `auth.uid()` directly, so it is the only NULL-comparison case. Pre-existing functions outside this project's scope (bookings, discounts, invoices) are left untouched.

## Follow-up

Update the security memory to record the rule: any directory RPC that mutates shared data must revoke `anon` EXECUTE and begin with an explicit `auth.uid() IS NULL` check.