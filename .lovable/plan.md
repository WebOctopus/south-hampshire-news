

## Changes to BookingTerms for Leafleting

**File: `src/components/dashboard/BookingTerms.tsx`**

Three targeted edits:

1. **Remove "Payment Schedule" row for leafleting** — The Payment Schedule row (lines 180-187) with the GoCardless Direct Debit text is irrelevant for leafleting. Wrap the `<Separator />` + Payment Schedule block in a condition: only show when `!isLeafleting`.

2. **Update support contact text** — Change line 204 from:
   `"For account queries, billing questions or changes to your subscription, please contact:"`
   to:
   `"For account queries, billing questions or changes to your subscription, please contact. Office hours are Mon-Fri 9am-4pm."`

3. **Also conditionally hide the GoCardless Bank Reference for leafleting** — The GoCardless reference (lines 170-177) is also irrelevant for leafleting since they pay by card. Wrap in `!isLeafleting`.

