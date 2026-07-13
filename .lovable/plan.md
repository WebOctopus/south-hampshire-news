## Plan: Payment-verified advertiser status

Replace `public.get_effective_advertiser_status(_user_id uuid)` with a version that determines "active" from real payment signals rather than booking status/date guesses. Database-only change — no edge functions, webhooks, `is_advertiser_active()`, or dashboard code touched (they call through this function and inherit the fix automatically).

### Migration

Single migration that runs `CREATE OR REPLACE FUNCTION public.get_effective_advertiser_status(_user_id uuid) ...` with the exact body supplied in the request.

New precedence:
1. Manual override on `profiles.advertiser_status` (`active`/`lapsed`/`none`) wins.
2. **ACTIVE** — booking joined to `gocardless_mandates.status='active'` OR `gocardless_subscriptions.status='active'` (no date check; fixes long-running subscribers wrongly lapsing after 12 months).
3. **ACTIVE** — one-off `bookings.payment_status='paid'` where `distribution_start_date` is within the last 2 months or future (fallback to `updated_at` within 2 months when null).
4. **LAPSED** — any historical booking with `payment_status IN ('paid','mandate_active','subscription_active')`.
5. **NONE** otherwise.

### Verification (after migration approval)

Run `supabase--read_query` calls to check `get_effective_advertiser_status` returns:
- `'active'` for a user with a live GoCardless mandate/subscription
- `'lapsed'` for a user whose only paid booking is >2 months old with no live mandate
- `'none'` for a user with only pending/unpaid bookings

Confirm `is_advertiser_active()` (unchanged) still returns the right boolean, which means the dashboard artwork gate keeps working without any frontend edit.

### Out of scope

No changes to: edge functions, `stripe-webhook`, `gocardless-webhook`, `is_advertiser_active()`, artwork gate, dashboard components, or any table schema.
