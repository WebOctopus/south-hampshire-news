# Fix escaped subjects and missing reply-to in directory emails

Both bugs are in `supabase/functions/send-directory-notification/index.ts`.

## 1. Subject line HTML entities

Today one `vars` map is built with every value passed through `escapeHtml`, and that
same map is used for both `template.subject` and `template.html_body`. So
"Sunrise Tools & Equipment" becomes "Sunrise Tools &amp; Equipment" in the subject.

Change: build two maps from the same source values.

- `varsRaw` — unescaped values, used for subject substitution.
- `varsHtml` — the escaped values (current behaviour), used for `html_body`.
- `admin_notes_block` stays HTML and is only ever used in the body, so it is built
  from the escaped notes and lives in `varsHtml` only.
- The hard-coded fallback subjects in each branch already interpolate the raw
  `business?.name`, so they are correct and stay as they are; the fallback body HTML
  keeps using escaped values.

This covers all five templates, since they all go through the same substitution call.

## 2. Empty reply_to

The Resend Node SDK v4 expects `replyTo` (camelCase) on `emails.send`. The function
passes `reply_to`, which the SDK ignores — hence `"reply_to": []` in the raw payload.

Change: send `replyTo: REPLY_TO`. Value stays `discover@discovermagazines.co.uk`.

## After the change

Redeploy `send-directory-notification`, then trigger one fresh send through the real
path (the claim submission on Sunrise Tools & Equipment). I then check `email_send_log`
for the `sent` row, and you confirm from the Resend raw payload that:

- `subject` reads `New listing claim: Sunrise Tools & Equipment` (no `&amp;`)
- `reply_to` contains `discover@discovermagazines.co.uk`
- the html part still shows `<strong>Sunrise Tools &amp; Equipment</strong>`

Template verification (steps 3-6 and the import re-run) resumes from there unchanged.
