# Verify the directory notification emails through the real path

You are right: a direct SQL insert into `business_claim_requests` sends nothing — the claim email is fired by the front end after the insert, and the approve/reject emails are fired by the admin screen after the RPC. Verification has to go through the UI.

Also noted: `d4d17847-b6aa-419b-9740-8b97d85cb851` (hello@edit82.co.uk) is a real contact and will not be used. No test data will be inserted against it.

## What is already done

- The five `directory_*` rows exist in `email_templates`, each with a unique HTML comment marker.
- Token parity check passed: every `{{token}}` in each subject/body is listed in that row's `available_variables`.
- The notification function now builds `admin_notes_block` and is deployed.
- Admin preview sample values for the new variables are in place.

## Verification steps

1. **Driving** — you perform every browser step yourself with accounts you control. No sign-in details are requested or stored here. No real business contact addresses are used.

Listings used:

```text
claim test   -> Sunrise Tools & Equipment (sunrise-tools-equipment)
                7d4d343d-dc89-43ce-812c-1f3ba12e387c
removal test -> Solent Mobility Centre (solent-mobility-centre)
                a8dbee14-2d5d-4b27-a07b-549311e90a98
```

Pre-test state on both: `owner_id` null, `is_verified` false, `is_active` true, `suppressed` false.

2. **Claim submitted** — signed in as that test user, open a listing page and use "Claim this listing". Then confirm:
   - a row appears in `business_claim_requests`,
   - a row appears in `email_send_log` for `directory_claim_submitted_admin`,
   - the delivered admin email contains the template's HTML marker (proves the DB template was used, not the hard-coded fallback).
3. **Claim approved** — approve that same claim from the Directory Review Queue. Confirm the `directory_claim_approved_customer` send is logged and the delivered mail carries its marker.
4. **Claim rejected** — submit a second claim from the test account, reject it from the queue with an admin note, and confirm the `Reason:` paragraph renders. Repeat once with the note left blank to confirm `admin_notes_block` collapses to nothing rather than an empty `<p></p>`.
5. **Removal approved** — submit a removal request from the public dialog using the test address, approve it from the Removals tab, and confirm both `directory_removal_submitted_admin` and `directory_removal_approved_customer` log and render.
6. **Cleanup** — after each check, revert the side effects: reset `owner_id` / `is_verified` on the claimed listing and `is_active` / `suppressed` on the removed listing to their pre-test values, and delete the test claim and removal rows. `email_send_log` rows are left in place as the audit trail.

## Check SQL after each step

Run these as you go; I read the same tables to confirm.

**After step 2 — claim submitted:**

```sql
select id, status, verification_method, created_at
from business_claim_requests
where business_id = '7d4d343d-dc89-43ce-812c-1f3ba12e387c'
order by created_at desc;

select template_name, recipient_email, recipient_type, status, error_message, created_at
from email_send_log
where template_name like 'directory_%'
order by created_at desc limit 10;
```

Expect one pending claim and one `directory_claim_submitted_admin` row with status `sent`.

**After step 3 — claim approved:**

```sql
select owner_id, is_verified
from businesses where id = '7d4d343d-dc89-43ce-812c-1f3ba12e387c';

select template_name, recipient_email, status, error_message, created_at
from email_send_log
where template_name like 'directory_claim%'
order by created_at desc limit 5;
```

Expect `owner_id` set, `is_verified` true, and a `directory_claim_approved_customer` send.

**After step 4 — claim rejected, once with a note and once without:**

```sql
select status, admin_notes, reviewed_at
from business_claim_requests
where business_id = '7d4d343d-dc89-43ce-812c-1f3ba12e387c'
order by created_at desc limit 3;

select template_name, recipient_email, status, error_message, metadata, created_at
from email_send_log
where template_name = 'directory_claim_rejected_customer'
order by created_at desc limit 5;
```

Two rejected sends expected. The one with a note shows a **Reason:** paragraph; the one without shows no empty paragraph.

**After step 5 — removal submitted then approved:**

```sql
select id, status, requester_email, relationship, reviewed_at
from business_removal_requests
where business_id = 'a8dbee14-2d5d-4b27-a07b-549311e90a98'
order by created_at desc;

select is_active, suppressed
from businesses where id = 'a8dbee14-2d5d-4b27-a07b-549311e90a98';

select template_name, recipient_email, status, error_message, created_at
from email_send_log
where template_name like 'directory_removal%'
order by created_at desc limit 5;
```

Expect `is_active` false, `suppressed` true, and both removal sends logged.

**Step 6 — cleanup and confirmation:**

```sql
update businesses
set owner_id = null, is_verified = false
where id = '7d4d343d-dc89-43ce-812c-1f3ba12e387c';

update businesses
set is_active = true, suppressed = false
where id = 'a8dbee14-2d5d-4b27-a07b-549311e90a98';

delete from business_claim_requests
where business_id = '7d4d343d-dc89-43ce-812c-1f3ba12e387c';

delete from business_removal_requests
where business_id = 'a8dbee14-2d5d-4b27-a07b-549311e90a98';

select id, owner_id, is_verified, is_active, suppressed, featured
from businesses
where id in ('7d4d343d-dc89-43ce-812c-1f3ba12e387c',
             'a8dbee14-2d5d-4b27-a07b-549311e90a98');
```

`email_send_log` rows stay in place as the audit trail.

## Marker check

To prove each delivered email came from the database template rather than the hard-coded fallback:

```sql
select name, substring(html_body from '<!--[^>]*-->') as marker
from email_templates
where name like 'directory_%'
order by name;
```

Paste the raw source of one delivered email per template and I will match it against the marker.
