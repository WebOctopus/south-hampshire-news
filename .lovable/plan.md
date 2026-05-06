The database policy is now correct: `competition_entries` has an `INSERT` policy for both `anon` and `authenticated` users.

The remaining problem is in the frontend mutation. It inserts the entry and then immediately asks Supabase to return the inserted row using:

```ts
.insert(entry)
.select()
.single()
```

Because competition entries contain personal data, anonymous users do not have `SELECT` access to `competition_entries`. That is good for privacy, but it means the submit flow can still fail after/while inserting because the frontend is trying to read the private entry back.

## Plan

1. Update `src/hooks/useCompetitions.ts`
   - Change the public competition entry insert to only perform the insert.
   - Remove `.select().single()` from `useCreateCompetitionEntry()`.
   - Return the submitted entry payload locally instead of asking Supabase to read the private row back.

2. Preserve entry privacy
   - Do not add a public `SELECT` policy for `competition_entries`.
   - Admin-only viewing of entries remains unchanged.

3. Keep the webhook behaviour
   - Continue calling `send-competition-entry-webhook` only after the database insert succeeds.
   - The webhook will still receive the competition ID and look up/send the competition title, prize, category, and entrant details.

4. Make the webhook callable from public submissions
   - Add `send-competition-entry-webhook` to `supabase/config.toml` with `verify_jwt = false`, matching the other public form/webhook functions.
   - This prevents the next failure after the insert is fixed, where an anonymous frontend submission could be blocked when invoking the Edge Function.

5. Verify the intended flow
   - Confirm the frontend no longer attempts to read from `competition_entries` after submitting.
   - Confirm anonymous users can submit while entries remain hidden from the public.