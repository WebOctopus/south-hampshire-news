## Goal
Send competition entry form data to the external webhook, including the competition title so recipients can see which competition was entered.

## Approach
Create a new Supabase Edge Function `send-competition-entry-webhook` that:
1. Accepts the entry payload + `competition_id` from the client.
2. Looks up the competition (title, prize, category) from the `competitions` table using the service role.
3. POSTs a JSON payload to: `https://nztjzyhtynfijonrkuem.supabase.co/functions/v1/inbound-webhook/bd116a69-213e-4fe4-a0f8-65b7dd8db823`

Using an edge function (rather than calling the webhook directly from the browser) avoids CORS issues, hides the request from the client, and allows server-side enrichment with the competition title.

## Webhook payload
```json
{
  "competition_id": "...",
  "competition_title": "Win a Spa Day",
  "competition_prize": "...",
  "competition_category": "...",
  "name": "...",
  "email": "...",
  "postcode": "...",
  "phone": "...",
  "message": "...",
  "agreed_to_terms": true,
  "submitted_at": "2026-05-05T..."
}
```

## Client change
In `src/hooks/useCompetitions.ts` → `useCreateCompetitionEntry`:
- After the successful `insert` into `competition_entries`, call `supabase.functions.invoke('send-competition-entry-webhook', { body: { ...entry } })`.
- Webhook failure is logged but does not block the user-facing success toast (entry is already saved).

## Files
- New: `supabase/functions/send-competition-entry-webhook/index.ts` (with CORS headers, JWT not required).
- Edited: `src/hooks/useCompetitions.ts` to invoke the function after entry insert.

No database schema changes required.