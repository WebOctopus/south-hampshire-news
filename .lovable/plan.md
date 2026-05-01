## Hide Events & Directory from public (admin-only while in development)

While the Events and Business Directory pages are still being built, we'll hide every public entry point to them but keep them fully accessible for signed-in admin users so you can keep developing and previewing.

### What "hide" means

- Public visitors and signed-in non-admin users: no links, no cards, no nav items pointing to `/whats-on`, `/whats-on/archive`, `/events/:slug`, `/business-directory`, or `/business/:id`. Direct URL visits return the existing 404 page.
- Admin users (anyone with the `admin` role): everything appears exactly as it does today — nav dropdowns, footer links, homepage cards, and direct routes all work.

### Where the entry points live today

1. **Top navigation** (`src/components/Navigation.tsx`)
   - Desktop dropdown sections: `Events` and `Directory` in `allDropdownSections`
   - Mobile menu uses the same `allDropdownSections` array
2. **Homepage cards** (`src/components/IconCardsSection.tsx`)
   - Card linking to `/whats-on`
   - Card linking to `/business-directory`
3. **Footer** (`src/components/Footer.tsx`)
   - Desktop list: "Events & What's On" + "Directory" links
   - Mobile list: same two links
4. **Routes** (`src/App.tsx`)
   - `/whats-on`, `/whats-on/archive`, `/events/:slug`, `/business-directory`, `/business/:id`

### Approach

Use the existing `useAuth()` hook which already exposes `isAdmin`. No new role, no DB changes, no feature flag table — just a single source of truth wrapped in a tiny helper.

1. **Add a small helper** `src/hooks/useFeatureVisibility.ts`
   - Exports `useEventsAndDirectoryVisible()` returning `isAdmin` from `useAuth()`.
   - Single place to flip the toggle when you're ready to launch publicly (just return `true`).

2. **Navigation.tsx**
   - Build `allDropdownSections` conditionally: filter out the `Events` and `Directory` entries when the helper returns `false`.
   - Same filter applied to the mobile accordion (it iterates the same array, so one change covers both).

3. **IconCardsSection.tsx**
   - Filter the cards array to drop the Events and Directory cards when the helper returns `false`.

4. **Footer.tsx**
   - Wrap the two `Events & What's On` and `Directory` `<li>` entries (desktop + mobile blocks) in a conditional so they only render for admins.

5. **App.tsx — route gating**
   - Wrap `/whats-on`, `/whats-on/archive`, `/events/:slug`, `/business-directory`, `/business/:id` in a new `<AdminOnlyRoute>` wrapper (lives next to `ProtectedRoute`).
   - `AdminOnlyRoute`: if `loading` show nothing; if `isAdmin` render children; otherwise render `<NotFound />` (so the URL behaves like it doesn't exist rather than redirecting and tipping off that the page exists).

6. **Leave untouched**
   - `/add-event` — already behind `ProtectedRoute`; harmless to leave reachable, but since its only entry points (`/whats-on?tab=add` and the homepage form) are now hidden too, it's effectively invisible. No change needed.
   - Admin tooling, dashboard, edge functions, DB content, email templates — all unchanged.
   - SEO/sitemap — no sitemap file detected; nothing to update.

### Result

- Public site shows no trace of Events or Directory anywhere.
- You (signed in as admin) see and use both sections exactly as today, so development continues unblocked.
- Re-enabling for the public is a one-line change in `useFeatureVisibility.ts`.
