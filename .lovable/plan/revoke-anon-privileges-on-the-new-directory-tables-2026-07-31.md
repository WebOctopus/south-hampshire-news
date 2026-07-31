# Revoke anon privileges on the new directory tables

Confirmed current state: all four new tables (`directory_areas`, `business_areas`, `keywords`, `business_keywords`) currently carry full privileges for `anon`, inherited from Supabase's default privileges on the `public` schema. RLS blocks anon reads today, but the grants sit underneath it and should be removed.

## What will change

A single migration that removes every privilege the `anon` role holds on those four tables. Nothing changes for signed-in users, admin tooling, or backend/service access. The SECURITY DEFINER functions planned for the next phase run as the function owner, so they are unaffected.

## Technical detail

```sql
REVOKE ALL ON public.directory_areas FROM anon;
REVOKE ALL ON public.business_areas FROM anon;
REVOKE ALL ON public.keywords FROM anon;
REVOKE ALL ON public.business_keywords FROM anon;
```

- No changes to `authenticated` or `service_role` grants.
- No RLS policy changes, no schema changes, no data changes.
- No front-end changes: nothing in the app reads these tables directly as a logged-out visitor.
