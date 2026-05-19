## Issue

The 3+ Subscription booking confirmation email shows literal `{{title_dimensions}}` in the Dimensions row.

## Root cause

The `booking_bogof_customer` DB email template references `{{title_dimensions}}`, but the edge function `send-booking-confirmation-email/index.ts` only populates a `dimensions` variable (looked up from `ad_sizes.dimensions` by `ad_size` name). Since no `title_dimensions` key exists in the `vars` map, the placeholder is left unreplaced.

## Fix

Add `title_dimensions` as an alias in the `vars` map in `supabase/functions/send-booking-confirmation-email/index.ts` (around line 484), pointing to the same `adDimensions` value already resolved:

```ts
dimensions: adDimensions,
title_dimensions: adDimensions,
```

This is safer than editing the DB template (other variants may also drift), keeps both placeholder names working, and is a one-line change.

## Scope

- Edit: `supabase/functions/send-booking-confirmation-email/index.ts` — add `title_dimensions` alias only.
- Not touched: DB templates, other vars, pricing logic, webhook.

## Verification

Re-trigger a BOGOF booking confirmation: the Dimensions row should render the actual dimensions string (e.g. "92mm × 132mm") instead of `{{title_dimensions}}`.