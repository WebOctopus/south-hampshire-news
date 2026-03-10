

## Make Booking Type & Duration Fields Editable

Add editable text for the "Booking Type" and "Minimum Duration" fields across all 3 package summary components.

### Changes

**`src/hooks/useAdvertisingContent.ts`** — Add to the existing `bookingSummary` section:
- `bogof.bookingTypeText`: "3+ Repeat Package for New Advertisers including Buy One Area Get One Area Free"
- `bogof.minimumDurationText`: "3 issues per area = 6 months"
- `fixed.bookingTypeText`: "Fixed Term"
- `leafleting.bookingTypeText`: "Leaflet Distribution Campaign"

**`src/components/BookingSummaryStep.tsx`** — Wrap the Booking Type value (line 240) and Minimum Duration value (line 244) in `EditableText` linked to `bookingSummary.bogof.bookingTypeText` and `bookingSummary.bogof.minimumDurationText`.

**`src/components/FixedTermBasketSummary.tsx`** — Wrap the Booking Type value (line 128) in `EditableText` linked to `bookingSummary.fixed.bookingTypeText`.

**`src/components/LeafletBasketSummary.tsx`** — Wrap the Booking Type value (line 161) in `EditableText` linked to `bookingSummary.leafleting.bookingTypeText`.

