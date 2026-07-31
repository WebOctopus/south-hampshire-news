# Fix the directory notification sender address

## Cause (confirmed)

Every working email function in this project sends from:

`Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>`

(booking confirmation, event notification, event organiser login, password reset, welcome email, admin-manage-user — all nine send sites).

`send-directory-notification` is the only one that sends from
`Discover Magazine <discover@discovermagazines.co.uk>`. That domain is not verified on the Resend account behind `RESEND_API_KEY`, which is exactly what Resend's error says. The key is fine; the from-domain is not.

## Change

In `supabase/functions/send-directory-notification/index.ts`:

- Change the `FROM` constant to `Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>` so it matches the verified domain used everywhere else.
- Add `reply_to: "discover@discovermagazines.co.uk"` on the send so replies from claimants and requesters still land in the Discover inbox.
- Leave the admin recipient and the CC on `discover@discovermagazines.co.uk` unchanged (recipients are unrestricted; only the from-domain must be verified).

Then redeploy the function.

## After deploy

Re-run step 2 of the verification: submit the claim on Sunrise Tools & Equipment through the claim button. I then read `email_send_log` for a `sent` row on `directory_claim_submitted_admin`, and you confirm the delivered mail source contains
`<!-- tpl:directory_claim_submitted_admin -->`. Template verification resumes from there; steps 3-6 and the import re-run are unchanged.

## Alternative if you'd rather keep the discovermagazines.co.uk sender

Verify `discovermagazines.co.uk` in the same Resend account that issued `RESEND_API_KEY` (add its DNS records), then all functions can move to that sender in one pass. That is a DNS/account task on your side; say the word and I'll plan that instead of the one-line sender change.
