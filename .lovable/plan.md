# Allow public competition entry submissions

## Problem
Submitting the Enter Competition form fails with:
> new row violates row-level security policy for table "competition_entries"

The existing INSERT policy "Anyone can create competition entries" was created without specifying roles, so it doesn't actually allow `anon` or `authenticated` to insert. Only admins can insert today.

## Fix
Run a migration on `public.competition_entries` that:

1. Drops the existing INSERT policy `Anyone can create competition entries`.
2. Recreates it explicitly granted to both `anon` and `authenticated`:
   ```sql
   CREATE POLICY "Anyone can create competition entries"
     ON public.competition_entries
     FOR INSERT
     TO anon, authenticated
     WITH CHECK (true);
   ```

Existing SELECT/ALL admin-only policies remain unchanged, so entries stay private to admins — only insertion becomes public.

## Verification
After the migration, a logged-out user submitting the form on `/competitions` should see "Entry submitted successfully!" and the entry should appear in `competition_entries` and trigger the existing webhook.

No frontend code changes are required.
