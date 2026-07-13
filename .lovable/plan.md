# Client Dossier Panel

Replace the current "Client dossier coming next" placeholder dialog in the Clients directory with a real read-only dossier, powered by a single `admin_get_client(email)` RPC call.

## New component

`src/components/admin/ClientDossierPanel.tsx`

- Props: `email: string | null`, `open: boolean`, `onOpenChange: (open: boolean) => void`.
- Uses shadcn `Sheet` (side="right", `className="w-full sm:max-w-2xl overflow-y-auto"`) for a slide-over panel.
- On open (and when `email` changes), calls `supabase.rpc('admin_get_client', { p_email: email })` once and stores the returned `jsonb` in local state. Tracks `loading` and `error`. Refetches only when email changes or panel reopens.
- Types the payload with a local `ClientDossier` interface mirroring the RPC contract (contact, account, quote_requests[], quotes[], bookings[], payments[], activity[]) — the generated types file exposes `admin_get_client` returning `Json`, so we cast once at the boundary.

## Wire-up in `AdminDashboard.tsx`

- Add `dossierEmail: string | null` state and `dossierOpen: boolean`.
- Replace the existing placeholder dialog trigger in `ClientsManagement` — pass an `onOpenDossier(email)` callback that sets `dossierEmail` + opens the sheet.
- Remove the placeholder `Dialog` block from `ClientsManagement.tsx`; render `<ClientDossierPanel />` from `AdminDashboard`.

## Panel sections (top to bottom, read-only)

### 1. Header
- `contact.display_name` (fallback to email), `company`, `email` (mailto), `phone` (tel).
- Advertiser Status badge from `account?.effective_advertiser_status ?? 'none'` (colour: active=green, lapsed=amber, none=muted).
- If `account` is not null, small card underneath showing:
  - `advertiser_status_setting` vs `effective_advertiser_status` (side by side, note if they differ)
  - `agency_name`, `agency_discount_percent` (as %), `discount_type`

### 2. Bookings
- `bookings[]` — one `Card` per booking, ordered newest first.
- Prominent top banner per card driven by `confirmed`:
  - `confirmed === true` → green "PAYMENT CONFIRMED" pill + `payment_status`
  - else → red/amber "Awaiting payment" + `payment_status`
- Body fields:
  - **Plan**: `pricing_model` + (when `duration` is present) `duration.name`; badge "Subscription" if `duration?.type === 'subscription'`, "Fixed term" if `duration?.type` is set otherwise; when `duration` is null render plan as `pricing_model` alone with no type badge
  - **Ad size**: `ad_size`
  - **Locations**: `locations[]` as chips; when null/empty render "—"
  - When `pricing_model === 'bogof'`, additionally show two labelled groups: "Paid areas" (`bogof_paid[]`) and "Free areas" (`bogof_free[]`), each rendering "—" when the array is null/empty
  - **Starting issue**: `starting_issue`
  - **Total**: `final_total` formatted as `£X,XXX.XX`
  - **Discount code**: `discount_code` if truthy
  - **T&Cs**: green "Accepted {date}" when `terms_accepted_at`, else red "Not accepted"
  - **Status**: `status`
  - **Invoice**: `invoice_number` when present

### 3. Quotes & form-fills
- `quotes[]` and `quote_requests[]` as lighter, denser cards (muted background).
- Fields: `pricing_model`, `ad_size`, `duration?.name` (+type badge) — falling back to plain `pricing_model` when duration is null, `locations[]` as chips (null/empty → "—"), `starting_issue`, `final_total` as £, `status`.
- Quotes additionally show `discount_code` and `terms_viewed_at` when present.
- Section heading shows counts, e.g. "Quotes (3) & form-fills (1)".

### 4. Payments
- `payments[]` rendered as a simple table/list of rows: source (Stripe/GoCardless), kind (one-off / mandate / subscription), status, amount (£ when non-null, "—" when null e.g. mandate), date (formatted).

### 5. Activity timeline
- `activity[]` — array is oldest-first from the RPC; render newest-first (`[...activity].reverse()`).
- Each row: type-specific `lucide-react` icon, `label`, formatted `at` timestamp. Email rows additionally show `status` as a small badge.
- Icon mapping: `form_fill` → FileText, `quote_created` → FileSearch, `booking_created` → ShoppingCart, `payment_confirmed` → CreditCard, `terms_accepted` → ShieldCheck, `email` → Mail.

## Loading / empty / error states

- Loading: skeletons for header + section stubs.
- Error: inline error alert with retry button.
- Empty arrays: show "No bookings yet." / "No quotes." / "No payments." / "No activity." in each section.

## Robustness rules (apply throughout)

- Every array field from the RPC (`locations`, `bogof_paid`, `bogof_free`, `quotes`, `quote_requests`, `bookings`, `payments`, `activity`) is treated as possibly `null` — guard with `?? []` before `.map()` / `.length` checks so no render crashes on missing data.
- `duration` may be `null` on quote_requests and some quotes — render plan/duration line without the name or type badge in that case; never dereference `duration.name` unconditionally.
- Empty location/area arrays render as an em-dash "—" rather than an empty chip row.

## Formatting helpers

Small local helpers in the panel file:
- `formatGBP(n: number | null)` → `£X,XXX.XX` or "—"
- `formatDate(iso: string | null)` → project's existing date format (reuse `date-fns` if already imported elsewhere; otherwise `new Date(iso).toLocaleString('en-GB')`)

## Out of scope

- Any editing inside the panel (roles, statuses, invoices, resends).
- Pagination inside sections — all arrays render in full.
- Refetching after account mutations elsewhere in the dashboard.
- Changes to `admin_get_client` SQL.

## Technical notes

- Read-only; no mutations, no cache invalidation wiring.
- Uses shadcn primitives already in the project: `Sheet`, `Card`, `Badge`, `Button`, `Separator`, `Skeleton`.
- All copy in British English; currency in GBP; "T&Cs" phrasing matches the rest of admin UI.
