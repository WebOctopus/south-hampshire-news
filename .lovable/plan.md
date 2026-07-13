# Admin Client Directory — Data Layer (v2)

Single migration adds two admin-only RPCs keyed on `lower(email)`, unifying `quote_requests`, `quotes`, `bookings`, and `profiles`+`auth.users`. No table changes.

Both functions: `SECURITY DEFINER`, `SET search_path = public`, first check `has_role(auth.uid(), 'admin')` — non-admins get empty rows (function 1) or `raise exception 'not authorised'` (function 2).

## Function 1 — `admin_list_clients()`

Returns one row per distinct `lower(email)`.

CTE pipeline:
1. **emails** — `UNION` of `lower(email)` from `quote_requests`, `quotes`, `bookings`, `auth.users` (via `profiles`); drop nulls/blanks.
2. **profile_match** — email → `auth.users` → `profiles` for `user_id`, display_name, company, phone, advertiser fields.
3. **latest_contact** — most recent non-null name/company/phone from bookings, then quotes, then quote_requests (`DISTINCT ON (email) ... ORDER BY created_at DESC`); coalesce with profile, preferring profile.
4. **counts** — per-email counts across the three source tables.
5. **spend** — `SUM(final_total)` from bookings where `payment_status IN ('paid','mandate_active','subscription_active')`.
6. **activity** — `GREATEST(MAX(created_at), MAX(updated_at))` across the three tables.
7. **facets** — array aggregates:
   - `ad_sizes_used`: distinct `ad_sizes.name` via `ad_size_id` across quotes + bookings.
   - `locations_used`:
     - magazine rows (`pricing_model IN ('fixed','bogof')`) → resolve names in `pricing_areas` from the **de-duplicated union of `selected_area_ids || bogof_paid_area_ids || bogof_free_area_ids`** (bogof stores paid in `selected_area_ids` and free only in `bogof_free_area_ids`).
     - leafleting rows → `selected_area_ids` → `leaflet_areas.name`.
   - `plan_types_used`: distinct `pricing_model` + `pricing_durations.duration_type` for used durations.
8. **flags**:
   - `has_confirmed_payment` — any booking with confirmed `payment_status`.
   - `has_accepted_terms` — any booking with `terms_accepted_at IS NOT NULL`.
   - `has_used_discount` — `bool_or(selections->'discount'->>'code' IS NOT NULL)` across quotes + bookings (the `discount` key is often present but JSON `null`; only a non-null `code` counts).
9. Final `SELECT`: `COALESCE(get_effective_advertiser_status(user_id), 'none')`, `ORDER BY last_activity_at DESC NULLS LAST`.

## Function 2 — `admin_get_client(p_email text)` → `jsonb`

Single `jsonb_build_object` with keys `contact`, `account`, `quote_requests`, `quotes`, `bookings`, `payments`, `activity`. Each list uses `jsonb_agg(... ORDER BY created_at)`.

- **contact**: profile + auth.users, falling back to latest booking/quote/quote_request row.
- **account**: profile fields + `get_effective_advertiser_status(user_id)`; `null` if no `user_id`.
- **quote_requests / quotes / bookings** — for each row resolve:
  - `ad_size` = `ad_sizes.name` via `ad_size_id`.
  - `duration` = `{name, type}` via `pricing_durations`.
  - `locations` (top-level resolved names[]):
    - `fixed` → `pricing_areas` names from `selected_area_ids`.
    - `bogof` → `pricing_areas` names from **de-duplicated union of `selected_area_ids || bogof_paid_area_ids || bogof_free_area_ids`**. Also emit sibling `bogof_paid` and `bogof_free` sub-arrays resolved from `bogof_paid_area_ids` and `bogof_free_area_ids`.
    - `leafleting` → `leaflet_areas` names from `selected_area_ids`.
  - `starting_issue` = `COALESCE(selections->>'selectedStartingIssue', distribution_start_date::text)` so it's rarely blank. Applied to all three record lists.
  - `discount_code` = `selections->'discount'->>'code'` (null when only the JSON-null placeholder is present).
  - Bookings only: `confirmed = payment_status IN ('paid','mandate_active','subscription_active')`, `terms_viewed_at`, `terms_accepted_at`, `invoice_number` via left join on `invoices`.
- **payments** — `UNION ALL` scoped to this client:
  - `gocardless_payments` joined via `booking_id` → bookings for this email → `{source:'gocardless', kind:'one-off', status, amount, date}`.
  - `gocardless_mandates` **filtered to this client** via `booking_id` → bookings for this email (or matching `user_id`) → `{kind:'mandate', ...}`.
  - `gocardless_subscriptions` **same client-scoping** → `{kind:'subscription', ...}`.
  - `bookings` with `payment_status='paid'` and no gocardless_payments row (treated as Stripe) → `{source:'stripe', kind:'one-off', status:'paid', amount:final_total, date:updated_at}`.
  Ordered date desc.
- **activity** — ascending timeline `UNION ALL`:
  - `quote_requests.created_at` → form_fill.
  - `quotes.created_at` → quote_created.
  - `bookings.created_at` → booking_created.
  - Payment confirmations from gocardless_payments/mandates/subscriptions and Stripe-paid bookings → payment_confirmed.
  - `bookings.terms_accepted_at` (when not null) → terms_accepted.
  - `email_send_log` rows for this email **filtered to `recipient_type = 'customer'`** → `{type:'email', label:template_name, status}` (excludes admin-copy notifications).

## Verification

After migration approval, via `supabase--read_query`:
1. `SELECT * FROM admin_list_clients() LIMIT 5` — inspect facets, counts, flags.
2. `SELECT admin_get_client('<known live-mandate email>')` — confirm `account.effective_advertiser_status='active'`, mandate appears in payments, bogof booking `locations` includes both paid+free areas with correct sub-arrays, `starting_issue` populated even when JSON key absent, `discount_code` correctly null on records with a JSON-null discount placeholder, activity contains only customer-facing emails.
3. Non-admin session — both refuse.

## Out of scope

No frontend/UI, no edge functions, no table or existing-function changes. Consuming admin UI is a follow-up.
