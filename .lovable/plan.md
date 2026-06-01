# Admin "Create on Behalf" — Reuse Existing Accounts

## Problem

When an admin uses **Create on behalf of a customer** in the checkout form, the second quote/booking for the same email errors out. The current code already passes `allow_existing_user: true` and the edge function tries to handle the case, but the existing-user detection only matches `createError.code === 'email_exists'`. Supabase Auth often returns a different shape (HTTP 422 with `msg`/`message` containing "already registered" / "User already exists"), so the catch block falls through and throws — surfacing as **"Error Creating Account"** on the admin's second attempt.

## Fix

Single, focused change in `supabase/functions/admin-manage-user/index.ts` (`create_user` action).

Broaden the existing-user detection so any of these from `adminClient.auth.admin.createUser` are treated as "existing user, just look them up":

- `error.code === 'email_exists'` (current)
- `error.status === 422`
- `error.message` / `error.msg` matching `/already.*registered/i` or `/already.*exists/i` or `/user.*exists/i`

When matched (and `allow_existing_user` is true), keep the current behaviour: list users, find by email, return `{ success: true, user_id, is_existing_user: true }`.

Also harden the lookup: `listUsers({ perPage: 1000 })` may not contain the target user if the project has >1000 accounts. Add a fallback — query `auth.users` via the service-role client (`adminClient.from('auth.users')` isn't allowed, so use a Postgres RPC or, simpler, paginate `listUsers` until found, capped at e.g. 5 pages of 1000). For this project's current scale a single page is fine; paginate as a small safety net.

No changes required to:
- `src/components/AdvertisingStepForm.tsx` — already handles `is_existing_user` correctly in both quote and booking paths (lines 280–306 and 614–638), and the post-save copy/email branching for new vs. existing users is already in place.
- The on-behalf email flow — when `is_existing_user` is true, the confirmation email is sent with a login-link variant instead of generated credentials (already implemented).
- UI / toggle behaviour.

## Acceptance

- Admin enables "Create on behalf of a customer", uses an email that already has an account, completes the form → quote (or booking) saves successfully, no error toast, confirmation email goes out with the login-link variant.
- Admin can repeat this any number of times for the same customer email.
- New-customer path (email not in system) continues to create the account and email generated credentials, unchanged.

## Technical notes

File: `supabase/functions/admin-manage-user/index.ts`, `case "create_user"` block (~lines 262–290). Replace the narrow `code === 'email_exists'` guard with a helper like:

```ts
const isExisting =
  (err as any).code === 'email_exists' ||
  (err as any).status === 422 ||
  /already.*(registered|exists)|user.*exists/i.test((err as any).message ?? (err as any).msg ?? '');
```

Wrap the existing lookup-and-return logic with that guard.
