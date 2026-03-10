

## Update Quote Display Labels in Dashboard

The "Leafleting" text and "Draft" badge are both hardcoded in `src/pages/Dashboard.tsx`.

### Changes to `src/pages/Dashboard.tsx`

1. **Rename "Draft" to "Saved Quote"** — In the `getStatusBadge` function (~line 1183-1184), change the label from "Draft" to "Saved Quote". Also update the fallback text in the View Quote dialog (~line 1536).

2. **"Leafleting" campaign type label** — The text comes from a pricing_model mapping (~lines 1234-1238 and 1523-1527). Currently hardcoded as `'Leafleting'`. This can be changed to whatever label you prefer (e.g., "Leaflet Distribution Campaign" to match the booking summary). Also appears in the View Quote dialog and in `DeleteQuoteDialog.tsx` (line 53, which just shows `quote.pricing_model` raw).

These are display-only labels — no database changes needed. The underlying `pricing_model` value stays as `'leafleting'` and `status` stays as `'draft'` in the database.

