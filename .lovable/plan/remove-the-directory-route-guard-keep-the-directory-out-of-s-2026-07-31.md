# Remove the directory route guard, keep the directory out of search

## What changes

The directory and listing pages become publicly reachable by URL. The pre-launch
gate (and its tester allowlist) comes off. No navigation link is added yet — the
pages are reachable only by typing or sharing the URL until Melanie signs off on
the content.

Because unlinked is not unfindable, both directory paths get a `noindex,nofollow`
robots meta tag while they are open, plus matching `Disallow` rules in
`robots.txt`.

`AdminOnlyRoute` is not deleted — it still gates `/whats-on`,
`/whats-on/archive` and `/events/:slug`. Only the two directory routes are
unwrapped. The tester allowlist inside it is removed, since it existed purely for
directory testing and the events pages are admin-only by intent.

## Technical detail

- `src/App.tsx`
  - `/business-directory` renders `<BusinessDirectory />` directly.
  - `/business/:slug` renders `<BusinessDetail />` directly.
  - The `AdminOnlyRoute` import stays (three event routes still use it).

- `src/components/AdminOnlyRoute.tsx`
  - Drop `PREVIEW_TESTER_IDS`, the `isTester` check and the `user` destructure;
    back to a plain `isAdmin` check.

- New `src/hooks/useNoindex.ts`
  - On mount, appends `<meta name="robots" content="noindex,nofollow">` to
    `document.head`; removes it on unmount so other routes stay indexable.
  - Called from `src/pages/BusinessDirectory.tsx` and `src/pages/BusinessDetail.tsx`.

- `public/robots.txt`
  - Add `Disallow: /business-directory` and `Disallow: /business/` to each
    existing user-agent block (Googlebot, Bingbot, Twitterbot,
    facebookexternalhit, `*`), keeping the existing `Allow: /` lines above them.

## Launch checklist (the former Phase 6)

Three reversals, done together once the content is approved:
1. Add the Directory link to the main navigation.
2. Remove the `useNoindex` calls and the hook.
3. Remove the `Disallow` lines from `robots.txt`.

## Caveat worth knowing

This is a client-rendered app, so the `noindex` tag is added by JavaScript after
load. Googlebot renders JS and will honour it, and the `robots.txt` `Disallow` is
a hard block regardless — but a crawler that reads only the raw HTML and ignores
robots.txt would not see the tag. For pre-launch concealment of an unlinked
section this combination is sufficient.