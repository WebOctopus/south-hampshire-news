# Phase 5 Section 6 — Directory Claim & Removal Emails (revised)

The template rows were not inserted (the previous run was interrupted), so nothing is live yet. This revision adopts option (b) for the rejection reason and adds a variable-parity check across all five templates.

## 1. Template rows

Insert five rows into `email_templates`, each with a branded 600px shell (green header, footer with accounts@discovermagazines.co.uk / 023 8001 0123):

| name | recipient |
|---|---|
| `directory_claim_submitted_admin` | admin |
| `directory_claim_approved_customer` | claimant |
| `directory_claim_rejected_customer` | claimant |
| `directory_removal_submitted_admin` | admin |
| `directory_removal_approved_customer` | requester |

## 2. Rejection reason — option (b)

The rejection template uses `{{admin_notes_block}}`. The notification function gains one line that builds it server-side: when `admin_notes` is non-empty it becomes the complete `<p><strong>Reason:</strong> …</p>` paragraph; when empty it becomes an empty string, so no stray paragraph is rendered. `admin_notes` stays in the substitution map too, so either name works.

## 3. Variable parity — every template

The function's substitution map is the source of truth. Templates may only use these keys:

- claim templates: `business_name`, `business_slug`, `claimant_email`, `verification_method`, `verification_notes`, `admin_notes`, `admin_notes_block`
- removal templates: `business_name`, `requester_name`, `requester_email`, `relationship`, `reason`

`available_variables` on each row is set to exactly the keys that template's branch supplies, so the admin editor's chips cannot insert an unsupported variable.

Parity is then checked mechanically: extract every `{{token}}` from each stored `subject` and `html_body` with a SQL regex and assert the resulting set is a subset of that template's `available_variables`, and of the keys the function's branch actually builds. Any token outside the list is a bug to fix before shipping.

## 4. Admin preview sample data

Add sample values for the new variables (business name, claimant email, verification method and notes, requester name/email, relationship, reason, and a rendered reason paragraph for `admin_notes_block`) to the sample data map in the admin Email Templates screen so the live preview renders realistically.

## 5. Verification

1. Each new template body carries a unique HTML-comment marker naming the template — a marker that exists only in the database copy, never in the function's fallback HTML.
2. Run the parity check from section 3; it must return no unmatched tokens.
3. Trigger a real claim submission, an approve and a reject from the admin queue, and a removal submission plus approval.
4. Confirm `email_send_log` has a row per send with the expected `template_name` and status `sent`.
5. Inspect each delivered body for its marker and the 600px shell. A missing marker means the `directory_<type>` lookup did not match and the fallback ran silently — fix the row name before calling this done.
6. Confirm no literal `{{` survives in any delivered body, and that a rejection with no admin notes renders with no empty reason paragraph.
7. Remove the markers once every template is confirmed live.