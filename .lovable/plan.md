# Phase 5 Section 6 — Directory Claim & Removal Emails (final)

No `directory_*` rows exist yet — the previous insert runs were interrupted, so nothing is live. The notification function has already been updated to build `admin_notes_block` server-side (the full `Reason:` paragraph when admin notes exist, an empty string otherwise).

## Variable sources, confirmed against the function

The claim branch builds one shared map before splitting by type, so all of `business_name`, `business_slug`, `claimant_email`, `verification_method`, `verification_notes`, `admin_notes` and `admin_notes_block` are populated for every claim email — `claimant_email` is genuinely available in the approve branch and stays. The removal branch builds `business_name`, `requester_name`, `requester_email`, `relationship`, `reason`.

`available_variables` is narrowed to what each individual email actually uses, not the union:

| template | available_variables |
|---|---|
| `directory_claim_submitted_admin` | business_name, business_slug, claimant_email, verification_method, verification_notes |
| `directory_claim_approved_customer` | business_name, business_slug, claimant_email |
| `directory_claim_rejected_customer` | business_name, business_slug, claimant_email, admin_notes, admin_notes_block |
| `directory_removal_submitted_admin` | business_name, requester_name, requester_email, relationship, reason |
| `directory_removal_approved_customer` | business_name, requester_name, requester_email, relationship, reason |

## Work

1. Insert the five rows into `email_templates` with the branded 600px shell (green header, footer with accounts@discovermagazines.co.uk / 023 8001 0123), British English copy, the lists above, and a unique HTML-comment marker naming each template.
2. Rejection template uses `{{admin_notes_block}}` so an empty reason renders no stray paragraph.
3. Add sample values for the new variables to the sample data map in the admin Email Templates screen so the live preview renders realistically.
4. Deploy the notification function so the `admin_notes_block` change is live.

## Verification

1. Parity check by SQL: extract every `{{token}}` from each stored `subject` and `html_body` and assert it is contained in that row's `available_variables`; assert every listed variable is one the function's matching branch builds. No unmatched tokens either way.
2. Trigger a claim submission, an approve and a reject from the admin queue, plus a removal submission and approval.
3. Confirm `email_send_log` has one row per send with the expected `template_name` and status `sent`.
4. Confirm each delivered body contains its marker (absence means the `directory_<type>` lookup missed and the fallback ran silently) and no literal `{{` survives.
5. Confirm a rejection with no admin notes renders with no empty reason paragraph.
6. Remove the markers once every template is confirmed live.