

## Advertiser Status (Active / Lapsed) — Account Area

Today the only roles are `admin` and `user`. We'll layer an **advertiser status** on top of that role system so signed-in users see a tailored "My Account" experience based on whether they're a current or past advertiser.

### Concept

Rather than turning Active/Lapsed into full roles in the `app_role` enum (which would tangle with admin/user permission logic), we'll treat them as an **advertiser status** stored on the profile:

- `advertiser_status` ∈ `auto | active | lapsed | none`
- Default: `auto` — derived live from their bookings
- Admin can override to force `active`, `lapsed`, or `none`

A single derived value, `effective_advertiser_status`, is what the app reads at runtime:

| Stored | Live booking? | Past booking? | Effective |
|---|---|---|---|
| auto | yes | — | active |
| auto | no | yes | lapsed |
| auto | no | no | none |
| active / lapsed / none | — | — | (override wins) |

"Live booking" = any booking with `status` in (`confirmed`, `active`) **and** distribution end date >= today (or no end date with paid status). "Past booking" = any historical booking that doesn't qualify as live.

### Database changes

1. Add `advertiser_status` text column to `profiles` (default `'auto'`, check constraint `auto | active | lapsed | none`).
2. New SECURITY DEFINER RPC `get_effective_advertiser_status(_user_id uuid)` returning `'active' | 'lapsed' | 'none'`. Computes the table above by checking the `bookings` table.
3. New SECURITY DEFINER RPC `is_advertiser_active(_user_id uuid)` returning boolean (thin wrapper for RLS use).

No changes to `app_role`. No changes to existing RLS on bookings/quotes/vouchers — those already key off `user_id`.

### Admin: User Roles & Agency Management

In `src/pages/AdminDashboard.tsx` (the table at line ~735):

- **New column "Advertiser Status"** between "Role" and "Agency Status".
- Cell shows two things stacked: a small **badge** with the *effective* status (Active green / Lapsed amber / None grey) and a **`Select`** below it for the stored override (`Auto`, `Active`, `Lapsed`, `None`).
- Changing the select calls a new `handleUpdateAdvertiserStatus(user, value)` that updates `profiles.advertiser_status`.
- "Auto" is the default and shows what the system derived in the badge above.
- Search + edit/password/delete actions unchanged.

### User: Dashboard / "My Account" experience

`src/pages/Dashboard.tsx` already gates content via `activeTab` and `DashboardSidebar`. We'll fetch the effective status once on load via the new RPC and pass it into the sidebar + page logic.

**`src/components/dashboard/DashboardSidebar.tsx`** — accept new prop `advertiserStatus: 'active' | 'lapsed' | 'none'` and conditionally render groups:

| Section | Active | Lapsed | None |
|---|---|---|---|
| **Advertising** group | full (Create Booking, Quotes, Bookings, Artwork, Schedule, Vouchers, Terms) | reduced: Past Bookings, Past Quotes, Vouchers, Terms only | full (current behaviour — they're prospective) |
| **Magazines Online** (new group) | shows current + all past editions | shows past editions only (no current month) | hidden |
| **Business Directory** | unchanged | unchanged | unchanged |
| **Events** | unchanged | unchanged | unchanged |

A new dashboard tab `magazines` renders a grid of `MagazineEdition` cards (link out to the issue). For Lapsed users the query excludes the most recent `is_active` edition (highest `sort_order` or latest `issue_month`).

A small **status banner** appears at the top of the dashboard:
- Active: green "You're an active advertiser — full access to upcoming editions and tools."
- Lapsed: amber "Welcome back. Your account is currently inactive — past bookings and vouchers are still here. [Book again →]" linking to `/advertising`.
- None: no banner (nothing changes for prospects).

### New magazines tab content

`src/components/dashboard/MagazinesTab.tsx` (new) — uses existing `useMagazineEditions` hook with a `lapsed` flag to drop the current edition. Each card shows cover, issue month, title, and a "View Online" button (`link_url`). Empty state: "No magazines available yet."

### Files changed

- **Migration**: add `advertiser_status` column + 2 RPCs
- **Edit** `src/pages/AdminDashboard.tsx` — add Advertiser Status column, select handler, fetch effective status per user
- **Edit** `src/pages/Dashboard.tsx` — fetch effective status, pass to sidebar, render banner, mount new `magazines` tab, gate quote/booking creation tabs for Lapsed
- **Edit** `src/components/dashboard/DashboardSidebar.tsx` — accept `advertiserStatus`, conditionally render items + new "Magazines" group
- **New** `src/components/dashboard/MagazinesTab.tsx` — grid of editions, hides current for Lapsed
- **New** `src/components/dashboard/AdvertiserStatusBanner.tsx` — top-of-dashboard banner
- **Edit** `src/hooks/useMagazineEditions.ts` — optional `excludeCurrent` flag, or filter in the new component

### Result

- Admin can mark anyone Active or Lapsed (or leave on Auto) from the existing User Management table.
- Active advertisers get the full dashboard: bookings, artwork upload, vouchers, schedule, current + past magazines.
- Lapsed advertisers see a stripped-back "history & vouchers" view with all past editions but the current one hidden, plus a clear "Book again" CTA.
- Prospects (None) keep the current behaviour.
- No changes to admin or auth logic; the `app_role` enum stays `user | admin`.

