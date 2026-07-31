# Phase 5 Section 6 — Directory Claim & Removal Emails

## Current state (verified)

- The sending path already exists: the directory notification function handles all five directory notification types, looks up a template named `directory_<type>`, substitutes `{{variables}}`, sends via Resend, and writes every attempt (sent and failed) to `email_send_log`.
- All call sites are already wired: claim submitted (claim button), claim approved / rejected (admin claims queue), removal submitted and removal approved (removal dialog and admin removals panel).
- The gap is data only: `email_templates` contains no `directory_*` rows, so every directory email falls back to hard-coded HTML inside the function and none of them are editable in the admin Email Templates screen.

## What gets built

A single data migration inserting template rows so the four required emails (plus the already-wired removal-submitted admin alert) render from the database and appear in Admin > Email Templates:

| name | display name | recipient |
|---|---|---|
| `directory_claim_submitted_admin` | Directory — Claim Submitted (Admin) | admin |
| `directory_claim_approved_customer` | Directory — Claim Approved (Claimant) | claimant |
| `directory_claim_rejected_customer` | Directory — Claim Rejected (Claimant) | claimant |
| `directory_removal_approved_customer` | Directory — Listing Removed (Requester) | requester |
| `directory_removal_submitted_admin` | Directory — Removal Requested (Admin) | admin |

Each row carries a subject line, a 600px-wide branded HTML body matching the existing Discover email shell (green header, footer with accounts@discovermagazines.co.uk / 023 8001 0123), and the correct `available_variables` list so the admin editor's variable chips work:

- claim templates: `business_name`, `business_slug`, `claimant_email`, `verification_method`, `verification_notes`, `admin_notes`
- removal templates: `business_name`, `requester_name`, `requester_email`, `relationship`, `reason`

Copy uses British English and the project's terminology. The rejection email shows the reason block only when admin notes exist.

## Small code changes

- Add sample values for the new variables to the sample data map in the admin Email Templates screen so the live preview renders realistically.
- In the notification function, keep `admin_notes` as an empty string when absent so the rejection template degrades cleanly.

## Verification

Confirm the five rows exist and appear in Admin > Email Templates, then prove the database templates — not the hard-coded fallback — are what actually gets sent:

1. Insert a deliberate, unique marker string into each new template body (for example an HTML comment carrying the template name). The marker exists only in the database copy, never in the function's fallback HTML.
2. Trigger a real claim submission, then an approve and a reject from the admin queue, and a removal submission plus approval.
3. For each, check `email_send_log` has a row with the expected `template_name` (`directory_claim_submitted_admin`, `directory_claim_approved_customer`, `directory_claim_rejected_customer`, `directory_removal_submitted_admin`, `directory_removal_approved_customer`) and status `sent`.
4. Inspect the delivered email (or the rendered body) for the marker and for the branded 600px shell. If the marker is absent, the `directory_<type>` lookup did not match and the fallback ran silently — the name in `email_templates` is wrong and must be corrected before this is considered done.
5. Confirm every `{{variable}}` was substituted: no literal `{{` remains in the delivered body.
6. Remove the markers once each template is confirmed live.