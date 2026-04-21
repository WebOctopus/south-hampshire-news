

## Build Out Turnstile Spam Protection

Keys are ready — here's exactly what gets built. DB lockdown is already in place from the earlier migration.

### 1. Secrets to add
- `TURNSTILE_SITE_KEY` (public, used both server-side and exposed to frontend via the edge function or echoed config)
- `TURNSTILE_SECRET_KEY` (server-only, used for siteverify call)

Since Vite bundles `.env` at build time and we can't add `VITE_*` vars dynamically, the site key will be fetched from a tiny public config endpoint on first load (or hardcoded once you confirm — site keys are safe to commit).

### 2. New edge function: `submit-event`
Public function (`verify_jwt = false`) that handles the full validation pipeline:

1. Parse + Zod-validate body (event fields + `turnstileToken` + `honeypot` + `formLoadedAt`)
2. **Honeypot check** — if `website_homepage` is non-empty, log + return fake success
3. **Timing check** — if `Date.now() - formLoadedAt < 3000`, log + return fake success
4. **Turnstile siteverify** — POST token + remote IP to Cloudflare; reject on failure
5. **Content heuristics**:
   - >3 URLs in title+description+excerpt → reject
   - Spam TLDs (`.xyz .top .click .work`) → reject
   - Cyrillic / CJK script blocks in title → reject
   - Spam keyword list (viagra, casino, crypto airdrop, seo services, escort, replica, etc.) → reject
6. **Duplicate guard** — same title + date + location in last 7 days → reject
7. **Rate limit** — hash `x-forwarded-for` + daily salt; check `event_submission_log`:
   - >5 in last hour → reject
   - >15 in last 24h → reject
8. Insert event via service role (forces `is_published=false, featured=false, user_id=null`)
9. Log accepted submission to `event_submission_log` with `blocked_reason=null`
10. Fire-and-forget call to existing `send-event-notification`
11. Return `{ success: true, eventId }`

All rejections except Turnstile-fail return a generic success (silent honeypot/timing) or a friendly "couldn't submit" without revealing which check failed.

### 3. Frontend changes — `src/pages/AddEvent.tsx`
- Add `@marsidev/react-turnstile` package
- On mount: capture `formLoadedAt = Date.now()`
- Add hidden honeypot input `website_homepage` (CSS-hidden, `tabindex={-1}`, `autocomplete="off"`, `aria-hidden`)
- Render `<Turnstile>` widget above the submit button (only for unauthenticated path; authenticated dashboard flow stays untouched)
- Disable Submit until Turnstile token present
- Replace direct `supabase.from('events').insert(...)` with `supabase.functions.invoke('submit-event', { body: {...formData, turnstileToken, honeypot, formLoadedAt} })`
- Authenticated users on the public form still go through the edge function (consistent validation), or we can bypass for them — defaulting to "everyone goes through the function" for simplicity

### 4. Config
- Register `submit-event` in `supabase/config.toml` with `verify_jwt = false`

### Files changed
- **New**: `supabase/functions/submit-event/index.ts`
- **Edit**: `supabase/config.toml` (register function)
- **Edit**: `src/pages/AddEvent.tsx` (honeypot, timing, Turnstile widget, swap to function invoke)
- **New secrets**: `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- **Package**: `@marsidev/react-turnstile`

### Result
- Public `/add-event` form flows through one validated entry point — bots stopped at honeypot/timing/captcha/content/rate layers before ever touching the `events` table
- Real organisers see a near-invisible Cloudflare checkbox and submit normally
- Admin moderation queue, slug generation, email notifications, and the authenticated dashboard event flow are all unchanged

