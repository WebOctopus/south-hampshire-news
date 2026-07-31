# Open directory routes to admins plus a tester allowlist

## What changes

`AdminOnlyRoute` currently shows the 404 page to everyone who is not an admin, which makes it impossible to test the claim flow as a normal signed-in owner. It becomes a preview gate: admins, or any signed-in user whose id is in a short hard-coded tester allowlist, see the page; everyone else still gets the standard 404.

Jamie (jamie@mirola.io, user id `a637537f-dad5-452c-8d87-a6add67506ed`) goes on the allowlist so the owner-side claim and removal journey can be exercised with a non-admin account.

Nothing else changes. The v2 directory RPCs keep their anon grants — this guard is presentational only and is deleted wholesale at launch.

## Technical detail

- `src/components/AdminOnlyRoute.tsx`
  - Add a module-level `PREVIEW_TESTER_IDS: string[]` containing the single uuid above, with a comment noting the whole guard is removed at launch.
  - Pull `user` alongside `isAdmin` and `loading` from `useAuth()`.
  - Render children when `isAdmin || (user && PREVIEW_TESTER_IDS.includes(user.id))`; otherwise render `NotFound` as today. Loading spinner behaviour unchanged.
  - Optionally rename nothing — the component keeps its name and all six route usages in `src/App.tsx` stay as they are.

## Verification

Sign in as jamie@mirola.io and load `/business-directory` and a listing page — both should render rather than 404, and the "Claim this listing" button should be reachable so the claim email path can be tested end to end.
