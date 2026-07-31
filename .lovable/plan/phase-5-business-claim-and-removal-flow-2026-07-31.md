# Phase 5 — Business Claim and Removal Flow

Turns an approved claim into real ownership, locks down what an owner can change, and gives anyone a way to get an unwanted listing taken off the site permanently.

## 1. Listing constraints and owner guard rails (migration)

- Drop the unique index `unique_owner_business` so one user can own several listings.
- Drop the policy "Authenticated users can create businesses". Listings are created by admins and by the CRM importer only.
- Also drop the existing unique index `business_claim_requests_business_id_user_id_key` (business_id, user_id). It is a full unique, so a rejected claimant could never re-apply. It is replaced by a partial unique index that only blocks a second *pending* claim.
- New BEFORE UPDATE trigger on `businesses`: rejects a change to `featured`, `is_verified`, `suppressed`, `owner_id`, `crm_company_id` or `is_active` unless the writer is an admin or a privileged process. Privilege is detected by checking the session/current role (service role, superuser, SECURITY DEFINER context) as well as `has_role(auth.uid(),'admin')`, so the importer and the approve/reject functions are unaffected. Owners keep full control of name, about text, contact details, address, logo and images. The exception message names the blocked field.

## 2. Claim flow (migration)

- `business_claim_requests` gains `updated_at` plus the standard `update_updated_at_column()` trigger.
- Partial unique index on (business_id, user_id) WHERE status = 'pending'.
- `approve_business_claim(_claim_id)` — admin only. In one transaction: listing owner set to the claimant, `is_verified = true`, request status 'approved', `reviewed_at`, `reviewed_by`. Refuses when the listing is already owned by a different user, naming that owner in the message.
- `reject_business_claim(_claim_id, _reason)` — admin only. Sets status 'rejected', stores the reason in `admin_notes`, stamps review fields, never touches ownership or verification.

## 3. Removal flow (migration)

- New table `business_removal_requests`: business_id (cascade delete), requester_name, requester_email, relationship, reason, status ('pending' | 'approved' | 'rejected'), admin_notes, created_at, updated_at, reviewed_at, reviewed_by. RLS on, admin-only read and update, `REVOKE ALL ... FROM anon` in the same migration.
- `submit_business_removal_request(...)` — deliberately callable without an account, granted to anon and authenticated. Validates email format and requires name and reason, silently rejects a duplicate pending request for the same business + email, rate limits to 3 requests per email per 24 hours. Returns a bare success boolean and never any listing data.
- `approve_business_removal(_request_id)` — admin only. Sets `is_active = false` and `suppressed = true` on the listing and marks the request approved. The row is never deleted, because the importer would otherwise reinstate the listing; the importer already skips suppressed rows.
- `reject_business_removal(_request_id, _reason)` — admin only, listing untouched.

Every mutating function above: SECURITY DEFINER, `EXECUTE` revoked from anon and PUBLIC (except the removal submission), an `IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'` guard, NULL-safe ownership tests, and `out_`-prefixed output columns where a RETURNS TABLE is used.

## 4. Public front end

- Business detail page: a prominent "Is this your business? Claim this listing" and a quieter "Request removal" link.
- Claim requires sign-in and captures verification method (business email, phone callback, post) and notes — the existing claim button component is reused and pointed at the new flow.
- Removal opens a form with name, email, relationship and reason, no sign-in. On submit it always shows the same confirmation, so it never reveals whether a request already exists.

## 5. Admin front end

- The Claim Requests screen becomes a single review queue with Claims and Removals tabs, each showing pending and resolved history: business, requester, their notes, and approve/reject with an admin notes box.
- Approve and reject call the RPCs and surface the database exception text verbatim, since those messages are written for an admin to read.

## 6. Email

Four new rows in `email_templates`, sent through a new edge function that follows the existing render-and-log pattern, with every send written to `email_send_log`:
- claim submitted -> admin
- claim approved / rejected -> claimant
- removal submitted -> admin
- removal approved -> requester

## 7. End-to-end verification

Sign up and claim, admin approves, listing shows in the Verified tier; owner edits the listing and adds up to 2 keywords; the same owner claims and is approved for a second listing; a direct API attempt by that owner to set `featured` or `is_verified` is rejected by the trigger; a signed-out removal request is approved and the listing leaves the directory; a re-run of the CRM import leaves it gone and counts it in "suppressed, skipped".

## Files

- Migrations for sections 1-3 and the email template rows.
- `src/pages/Dashboard.tsx` — remove the create-listing path, keep edit mode.
- `src/components/BusinessClaimButton.tsx`, `src/pages/BusinessDetail.tsx`, `src/components/directory/BusinessDetailHero.tsx` — claim and removal entry points, plus a new removal request dialog component.
- `src/components/admin/ClaimRequestsManagement.tsx` — tabbed review queue, plus a removals panel component.
- New edge function for the four notification emails.