
Issue confirmed. The current failure path is still happening for existing customer emails.

What’s actually breaking:
1) `admin-manage-user` throws on `email_exists` (422) and returns a non-2xx response, so the frontend only sees generic `"Edge Function returned a non-2xx status code"`.
2) `AdvertisingStepForm` tries to recover by calling `action: 'list_users'`, but that action does not exist in the edge function and also fails the `user_id required` guard.
3) Because of (1) and (2), existing-user admin quote creation stops before quote/booking save.

Implementation plan

1) Update `supabase/functions/admin-manage-user/index.ts`
- Add support for an `allow_existing_user` flag on `create_user`.
- In `create_user`, when Supabase returns `email_exists`:
  - If `allow_existing_user === true`, resolve the existing auth user by email (using admin `listUsers` lookup), then return **200 success** with:
    - `user_id`
    - `user: { id, email }`
    - `is_existing_user: true`
  - If `allow_existing_user !== true`, keep current error behavior for Admin Dashboard create-user flow.
- Keep normal new-user success response as:
  - `user_id`
  - `user`
  - `is_existing_user: false`

2) Update `src/components/AdvertisingStepForm.tsx` (both Save Quote + Book handlers)
- Pass `allow_existing_user: true` in admin “create on behalf” calls.
- Remove brittle fallback logic that checks error text + calls nonexistent `list_users`.
- Use deterministic response fields:
  - `userId = createResult?.user_id || createResult?.user?.id`
  - `isNewUser = !createResult?.is_existing_user`
- Keep email payload branching as-is (already correct):
  - New user => `generated_password`
  - Existing user => `is_existing_user: true`

3) UX messaging cleanup (same file)
- Update admin success toast copy to match outcome:
  - New user: credentials created and emailed
  - Existing user: login link sent, use “Forgot password” if needed

Why this fixes your exact error loop
- Existing emails will no longer produce a blocking non-2xx failure in the on-behalf flow.
- The quote/booking continues using the existing user ID, and the email function gets the correct `is_existing_user` flag.

Validation checklist after implementation
1) Admin on-behalf with an already-registered email:
- No red error toast
- Quote/booking saves
- Customer email contains login CTA + forgot password guidance (no password block)
2) Admin on-behalf with a brand-new email:
- Account created
- Quote/booking saves
- Customer email includes generated credentials
3) Confirm edge logs no longer show unhandled `email_exists` errors for this flow.
