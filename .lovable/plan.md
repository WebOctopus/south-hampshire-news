## Amendment: add mandate/subscription activation milestones to `admin_get_client` activity timeline

Single migration that replaces `public.admin_get_client(text)` with an identical body except for two additional `UNION ALL` branches inside the `activity` CTE. Everything else — contact, account, quote_requests, quotes, bookings, payments, existing activity branches — stays byte-for-byte the same.

### Change

Inside the `activity` UNION in `admin_get_client`, after the existing Stripe/GoCardless-payment `payment_confirmed` branches, append:

```sql
UNION ALL
SELECT jsonb_build_object(
  'at', coalesce(gm.updated_at, gm.created_at),
  'type', 'payment_confirmed',
  'label', 'Direct Debit mandate active'
)
FROM public.gocardless_mandates gm
LEFT JOIN public.bookings b ON b.id = gm.booking_id
WHERE gm.status = 'active'
  AND ((b.id IS NOT NULL AND lower(b.email) = v_email)
       OR (v_user_id IS NOT NULL AND gm.user_id = v_user_id))

UNION ALL
SELECT jsonb_build_object(
  'at', coalesce(gs.updated_at, gs.created_at),
  'type', 'payment_confirmed',
  'label', 'Subscription active'
)
FROM public.gocardless_subscriptions gs
LEFT JOIN public.bookings b ON b.id = gs.booking_id
LEFT JOIN public.gocardless_mandates gm2
  ON gm2.gocardless_mandate_id = gs.gocardless_mandate_id
WHERE gs.status = 'active'
  AND ((b.id IS NOT NULL AND lower(b.email) = v_email)
       OR (v_user_id IS NOT NULL AND gm2.user_id = v_user_id))
```

Client scoping mirrors the existing `payments` section — via `booking_id → bookings.email`, or via `user_id` on the mandate (and on the linked mandate for subscriptions). Existing `gocardless_payments` and Stripe branches remain untouched so a client with both a mandate and a taken payment shows both milestones.

### Out of scope

No changes to `admin_list_clients`, tables, edge functions, or frontend. Function 1 is unaffected.

### Verification

After approval, via `supabase--read_query`:
1. `SELECT admin_get_client('<live-mandate email with no gocardless_payments row>')` — confirm `activity` now contains a `payment_confirmed` entry labelled "Direct Debit mandate active".
2. `SELECT admin_get_client('<client with both mandate and a taken one-off payment>')` — confirm both the mandate-active milestone and the existing one-off payment milestone appear.
3. Non-admin session — still refuses.
