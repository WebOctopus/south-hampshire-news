

## Stop Spam on Event Submissions

### Current state
The "Submit an Event" form on `/add-event` allows **anonymous** inserts directly into the `events` table (RLS policy: `Anyone can submit events for approval`). There is **no** rate limiting, captcha, honeypot, content filtering, or duplicate detection. A bot can POST to Supabase or hammer the form and flood admins with junk events.

### Defence-in-depth approach (4 layers)

We'll layer cheap, low-friction defences before paying the UX cost of a captcha. Together these stop ~99% of automated spam without annoying real organisers.

---

### Layer 1 — Honeypot field (invisible to humans)
Add a hidden `website_homepage` text field (CSS-hidden + `tabindex=-1` + `autocomplete=off`). Real users never see or fill it; most bots blindly fill every input. If it's non-empty on submit, we silently "succeed" (return success toast, don't insert). Catches the majority of dumb scrapers.

### Layer 2 — Time-to-submit check
Record `formLoadedAt = Date.now()` when the form mounts. On submit, reject (silently succeed) if `Date.now() - formLoadedAt < 3000ms`. Humans take >3 seconds to fill 10+ fields; bots submit in <500ms.

### Layer 3 — Cloudflare Turnstile (privacy-friendly captcha)
Add a Turnstile widget at the bottom of the form (free, no user puzzles in the common case — just a checkbox or fully invisible).

- **Frontend**: Render `<Turnstile siteKey={...} onSuccess={setToken} />` (use `@marsidev/react-turnstile`). Disable Submit until token present.
- **New Edge Function `submit-event`** (public, `verify_jwt = false`):
  1. Receives the form payload + Turnstile token + honeypot field + load timestamp.
  2. Verifies token against `https://challenges.cloudflare.com/turnstile/v0/siteverify` using `TURNSTILE_SECRET_KEY`.
  3. Re-runs honeypot + timing checks server-side (clients can't be trusted).
  4. Runs content checks (Layer 4).
  5. Inserts via the **service role key** into `events` (still as `is_published=false, featured=false`).
  6. Triggers existing `send-event-notification`.
- **RLS lockdown**: Drop the public `Anyone can submit events for approval` INSERT policy so the only insert path becomes the edge function (which validates first). Authenticated users keep their existing `Users can manage their own events` policy for the dashboard create flow.

New secrets needed: `TURNSTILE_SITE_KEY` (public, used in frontend via env), `TURNSTILE_SECRET_KEY` (server-only).

### Layer 4 — Content & rate heuristics in the edge function
Cheap checks before insert:

- **URL flood**: reject if `description + title + excerpt` contains >3 URLs or any obvious spam TLDs (`.xyz`, `.top`, `.click`, `.work`).
- **Cyrillic / mixed-script**: reject titles with non-Latin script blocks (most local event spam is foreign-language SEO junk). Allow common UK punctuation/emoji.
- **Spam keyword list**: reject on hits like `viagra`, `casino`, `crypto airdrop`, `seo services`, `escort`, `replica watches`, etc. (small curated list, easy to extend).
- **Duplicate guard**: reject if an event with the same `title` + `date` + `location` already exists in the last 7 days.
- **IP rate limit (best-effort)**: hash `x-forwarded-for` + a daily salt; track submissions per hash in a new lightweight `event_submission_log` table (`ip_hash`, `created_at`). Reject if >5 submissions from one IP in 1 hour or >15 in 24 hours. Auto-prune rows >7 days old.

> Note: per project policy, this is ad-hoc rate limiting at the application layer — there's no platform primitive for it yet. Happy to remove this sub-step if you'd rather not add it.

---

### Database migration

```sql
-- Lock down the public insert path
DROP POLICY IF EXISTS "Anyone can submit events for approval" ON public.events;

-- Lightweight submission log for rate limiting & abuse review
CREATE TABLE public.event_submission_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  user_agent text,
  blocked_reason text,            -- null = accepted
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.event_submission_log (ip_hash, created_at DESC);
ALTER TABLE public.event_submission_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view submission log"
  ON public.event_submission_log FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Inserts only via service role (no policy = denied for users)
```

### Files changed

- **New**: `supabase/functions/submit-event/index.ts` (validation + Turnstile + insert + trigger notification)
- **New**: `supabase/config.toml` entry registering `submit-event` with `verify_jwt = false`
- **Edit**: `src/pages/AddEvent.tsx` — add honeypot, load timestamp, Turnstile widget, swap direct `supabase.from('events').insert(...)` call for `supabase.functions.invoke('submit-event', { body: ... })`
- **New secrets**: `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (you'll need to create a free Cloudflare Turnstile site at dash.cloudflare.com → Turnstile → "Add site")
- **Migration**: drop public insert policy + create `event_submission_log`
- **Package**: add `@marsidev/react-turnstile`

### What this does NOT change
- The dashboard's authenticated event create/edit flow keeps using direct Supabase calls under the existing `Users can manage their own events` RLS policy — captcha is only required on the public anonymous form.
- Admin moderation queue stays exactly as today.
- No changes to email notifications or slug generation.

### Open question before we build
You'll need a free Cloudflare account for Turnstile (takes 2 mins). If you'd rather skip captcha entirely and rely on honeypot + timing + content checks + rate limiting only, say the word and I'll drop Layer 3 — that's still strong protection for a low-volume local-events form.

