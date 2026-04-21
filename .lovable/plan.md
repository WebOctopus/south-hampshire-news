

## Pretty Event URLs + Social Share Previews

### Goals
1. Share links use the event title (e.g. `/events/spring-fete-romsey-2026`) instead of the UUID.
2. When pasted into Facebook / WhatsApp / X / LinkedIn / iMessage, the link preview shows the **event image, event title, and excerpt** — not the generic Discover Magazine logo and tagline.

### Why this needs more than a meta tag tweak
This site is a Vite SPA. `index.html` is static, so social crawlers (which don't run JavaScript) only ever see the generic site-wide OG tags. Adding `react-helmet` would fix nothing for previews. The fix must serve crawler-specific HTML from the server side.

### Approach

**1. Add a `slug` column to `events`**
- New `text` column `slug`, unique, nullable for backfill.
- Backfill existing rows with a slugified title + short id suffix to guarantee uniqueness (`spring-fete-romsey-2026-a1b2`).
- Database trigger on insert/update: if `slug` is empty, auto-generate from `title`. If a collision occurs, append a 4-char suffix from the row id.

**2. Update routes to support slugs (with UUID fallback)**
- React Router: `/events/:slug` (keep `/events/:id` working by detecting UUID format and redirecting to the slug URL).
- `EventDetail.tsx` fetches by `slug` first; falls back to `id` for legacy links.
- `EventCard.tsx`, `WhatsOn.tsx`, related-event links, and the two edge functions (`send-event-organiser-login`, `send-event-notification`) all switch to `/events/<slug>`.

**3. Crawler-friendly OG previews via an Edge Function**
- New public Supabase Edge Function `event-og` (no JWT verification) at:
  `https://qajegkbvbpekdggtrupv.supabase.co/functions/v1/event-og?slug=<slug>`
- Behaviour:
  - Looks up the published event by slug.
  - Returns a tiny HTML document with:
    - `<title>{event.title} | Discover Magazine</title>`
    - `og:title`, `og:description` (excerpt or trimmed description)
    - `og:image` set to `event.image` (absolute URL)
    - `og:url` set to the canonical pretty URL
    - `twitter:card = summary_large_image`
    - A `<meta http-equiv="refresh">` + `<script>window.location.replace(...)</script>` redirect to the real SPA URL for human visitors.
  - Falls back to the site-wide OG tags if the slug is missing/unpublished.

**4. Route crawlers through the function**
We can't sniff user-agent on a static host, so instead:
- The **shareable URL we hand out** (in copy-link buttons, emails, sitemap, etc.) becomes the pretty SPA URL: `https://www.peacockpixelmedia.co.uk/events/<slug>`.
- A new `Share` helper in `EventDetail.tsx` builds this URL.
- For maximum compatibility (since SPA routes can't serve per-page meta), we also expose a "social share URL" used by the Web Share API and copy-to-clipboard:
  `https://qajegkbvbpekdggtrupv.supabase.co/functions/v1/event-og?slug=<slug>`
  This is the URL that gets posted to socials — crawlers see rich OG, humans get redirected to the pretty SPA URL within ~100ms.
- Email links from the two edge functions also use the `event-og` function URL so previews render in Gmail/Outlook/iMessage too.

**5. Optional polish**
- Add a `Copy share link` button on the event detail page that copies the social-friendly URL.
- Update `EventDetail.tsx`'s existing `Share2` icon button to use the Web Share API with the social URL as `url`.

### Files changed
- **DB migration**: add `slug` column, unique index, backfill, slug-generation trigger.
- **New edge function**: `supabase/functions/event-og/index.ts` (+ register in `supabase/config.toml` with `verify_jwt = false`).
- `src/App.tsx` — route `/events/:slug` (+ legacy `/events/:id` redirect handler).
- `src/pages/EventDetail.tsx` — fetch by slug, share button, related-link slugs.
- `src/hooks/useEvents.ts` — add `slug` to `Event` interface.
- `src/components/EventCard.tsx`, `src/pages/WhatsOn.tsx` — link by slug.
- `supabase/functions/send-event-notification/index.ts` and `send-event-organiser-login/index.ts` — emit social-friendly URLs.

### Result
- Old UUID links keep working (redirect to the new slug URL).
- New share links look like `…/events/summer-music-festival-2026`.
- Pasting that share link into Facebook/WhatsApp/X/LinkedIn/iMessage shows the **event's own image, title, and description** in the preview card.

