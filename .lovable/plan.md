## Rebuild admin Users section into a Clients directory

Replace the current Users table inside `src/pages/AdminDashboard.tsx` with a new `Clients` table driven by a single `admin_list_clients()` RPC call. All existing account-management mutations (role, advertiser status override, agency toggle/name/%, password, delete, edit dialog) are kept and remain wired to the same handlers already defined in `AdminDashboard`. The sidebar label changes from "Users" to "Clients".

### Data loading

- On mount (in place of the current `loadUsers`), call `supabase.rpc('admin_list_clients')` once and store the returned rows.
- Keep the existing `users` / `userEmails` / `effectiveAdvertiserStatuses` state and loaders **only** for account-holders — needed so the edit dialog, role dropdown, agency editing, password, and delete flows continue to work exactly as they do today.
- Build a `Map<string, AccountRow>` from the existing profiles-based `users` array **keyed on `lower(trim(email))`**. All lookups use `client.email` (already lower-cased by the RPC). Keying on stored/original case would silently drop account controls for any client whose stored email casing differs — so the lowercased key is mandatory everywhere the map is written or read.

### Post-mutation refresh

The Advertiser Status badge reads `effective_advertiser_status` from the initial RPC load, so it will go stale after edits. After any successful account mutation that can affect the effective status — advertiser-status override change, the edit dialog save, and the delete flow — re-run `admin_list_clients()` (simplest and consistent) so the badge, spend, counts, and facets all reflect the new state. Role changes also trigger a refetch for consistency. Use a small `refreshClients()` helper wrapping the RPC call and swap it into each existing handler alongside the current `loadUsers()` call (which stays, since the edit dialog still needs the account row).

### Sticky filter bar (client-side, AND-combined)

- Text search: case-insensitive substring over `display_name`, `company`, `email`.
- Advertiser Status: multi-select of `active` / `lapsed` / `none` matched against `effective_advertiser_status`.
- Advert Size: multi-select; options = union of all `ad_sizes_used`; row matches when its `ad_sizes_used` intersects the selection.
- Location: multi-select; options = union of all `locations_used`; intersect match.
- Plan Type: multi-select over `{fixed, bogof, leafleting, subscription}` present in `plan_types_used`; labels Fixed / BOGOF / Leafleting / Subscription; intersect match.
- Toggle switches: Has Confirmed Payment, Accepted T&Cs, Used Discount Code — each ANDs on the matching boolean when on.
- Live "Showing X of Y clients" count and a "Clear filters" button. Empty state when no rows match.
- Bar is `sticky top-0 z-10 bg-background` inside the tab content, with a small border-bottom.

Multi-selects use a shadcn `Popover` + `Command` checklist (same pattern already used elsewhere in admin) rather than a native select so long option lists remain usable.

### Table columns

| Column | Source |
|---|---|
| Name | `display_name || '—'` + a small muted "No account" chip when `!has_account`. Rendered as a button that opens the client dossier (dossier UI is a separate follow-up prompt — for now the button opens a placeholder `Dialog` showing "Client dossier coming next" plus the email). |
| Company | `company` |
| Email | `email` |
| Advertiser Status | Badge for `effective_advertiser_status` (green/amber/muted), **plus** the existing override `<Select>` (`auto`/`active`/`lapsed`/`none`) — **only rendered when `has_account`**, wired to the existing `handleUpdateAdvertiserStatus` using the mapped account row. |
| Quotes | `quote_requests_count + quotes_count` (single number, with `quote_requests_count` shown small underneath as "X requests"). |
| Bookings | `bookings_count` with muted "X paid" below when `paid_bookings_count > 0`. |
| Confirmed Spend | `total_confirmed_spend` formatted as `£X,XXX.XX`. |
| Last Activity | `last_activity_at` formatted as short date; muted "—" when null. |

Rows keep an action cluster (Role select, Edit, Password, Delete) rendered **only when `has_account`**, hitting the existing handlers via the account map. Rows without an account show a muted "No account" placeholder in the actions cell.

Sort default: `last_activity_at` desc (already the RPC's order). No column sort UI in this pass.

### Component structure

- New file `src/components/admin/ClientsManagement.tsx` containing the whole section: state, RPC load + `refreshClients()`, filter bar, table, and the placeholder dossier dialog. Props accept the callbacks and lookup map from `AdminDashboard`:
  - `accountByEmail: Map<string, AccountRow>` (keys lowercased)
  - `effectiveAdvertiserStatuses: Record<user_id, string>` (still used for account rows via the mapped `user_id`)
  - `onUpdateRole`, `onUpdateAdvertiserStatus`, `onEdit`, `onSetPassword`, `onDelete` — each takes the mapped account row and, on resolve, triggers `refreshClients()`.
- `AdminDashboard.tsx` keeps all current handlers and dialogs, replaces the inline users table markup with `<ClientsManagement ... />`, and swaps the sidebar/tab label from "Users" to "Clients". `AdminSidebar.tsx` updates the `title` for the `users` section to `"Clients"`; the `section` key stays `"users"` so routing is unchanged.
- No changes to any hooks, mutations, or the `admin-manage-user` edge function.

### TypeScript

Prefer the generated `Database['public']['Functions']['admin_list_clients']['Returns'][number]` row type from `src/integrations/supabase/types.ts`. If the build errors because the types weren't regenerated after the earlier migration, regenerate the Supabase types first; if regeneration isn't available in the current turn, fall back to a local `type ClientRow = { … }` mirroring the RPC's exact column list — do not leave it as `any`.

### Out of scope

- The client dossier UI (rendered by `admin_get_client`) — the Name button opens a placeholder now; the full dossier is the next prompt.
- Column sorting, pagination, CSV export.
- Any database changes.

### Verification

1. Load `/admin` → Clients tab; confirm every unique client email (with or without an account) appears once.
2. Apply each filter individually then combine several; confirm the count updates and AND semantics hold.
3. On an account-holder row (including one whose stored email casing differs from lower-cased), change role, change advertiser status override, open Edit and save agency name / discount / status, set password, delete — each should behave exactly as it does today, and the row's badge/counts should refresh to reflect the new state (no stale badge).
4. On a no-account row, confirm the muted "No account" marker shows, the advertiser status override + action buttons are absent, and the display badge still reads `none`.
5. Click a Name → placeholder dossier dialog opens with the correct email.
