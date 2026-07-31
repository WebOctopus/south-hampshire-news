# Verify the directory notification emails through the real path

You are right: a direct SQL insert into `business_claim_requests` sends nothing — the claim email is fired by the front end after the insert, and the approve/reject emails are fired by the admin screen after the RPC. Verification has to go through the UI.

Also noted: `d4d17847-b6aa-419b-9740-8b97d85cb851` (hello@edit82.co.uk) is a real contact and will not be used. No test data will be inserted against it.

## What is already done

- The five `directory_*` rows exist in `email_templates`, each with a unique HTML comment marker.
- Token parity check passed: every `{{token}}` in each subject/body is listed in that row's `available_variables`.
- The notification function now builds `admin_notes_block` and is deployed.
- Admin preview sample values for the new variables are in place.

## Verification steps

1. **Test account** — use a throwaway account you control (signed up through the app) as a non-admin claimant. No real business contact addresses anywhere in the test.
2. **Claim submitted** — signed in as that test user, open a listing page and use "Claim this listing". Then confirm:
   - a row appears in `business_claim_requests`,
   - a row appears in `email_send_log` for `directory_claim_submitted_admin`,
   - the delivered admin email contains the template's HTML marker (proves the DB template was used, not the hard-coded fallback).
3. **Claim approved** — approve that same claim from the Directory Review Queue. Confirm the `directory_claim_approved_customer` send is logged and the delivered mail carries its marker.
4. **Claim rejected** — submit a second claim from the test account, reject it from the queue with an admin note, and confirm the `Reason:` paragraph renders. Repeat once with the note left blank to confirm `admin_notes_block` collapses to nothing rather than an empty `<p></p>`.
5. **Removal approved** — submit a removal request from the public dialog using the test address, approve it from the Removals tab, and confirm both `directory_removal_submitted_admin` and `directory_removal_approved_customer` log and render.
6. **Cleanup** — after each check, revert the side effects: reset `owner_id` / `is_verified` on the claimed listing and `is_active` / `suppressed` on the removed listing to their pre-test values, and delete the test claim and removal rows. `email_send_log` rows are left in place as the audit trail.

## Technical notes

Steps 2-5 are driven in a headless browser against the running app. This project uses an external Supabase project, so no preview session is injected here — the browser run needs sign-in credentials for the test account, and a separate admin sign-in for the queue actions.

## What I need from you

- Which test account (email + password) should act as the claimant, and which listing is safe to claim and later restore.
- Whether I should drive the admin queue actions with an admin login you provide, or you perform the approve/reject clicks yourself while I check `email_send_log` and the markers afterwards.
