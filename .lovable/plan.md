

## Rename "Fixed Term" to "Pay As You Go" Across UI

### Scope
Replace all user-visible instances of "Fixed Term" with "Pay As You Go" across the application. Internal variable names, database values (`pricing_model: 'fixed'`), and code comments will remain unchanged.

### Files to Update

**Frontend Components:**
1. **`src/pages/Dashboard.tsx`** — Quote list label (`'Fixed Term'` → `'Pay As You Go'`)
2. **`src/pages/Advertising.tsx`** — Confirmation dialog title/description (~lines 724, 1312)
3. **`src/components/dashboard/CreateBookingForm.tsx`** — Radio label for fixed option (~line 556)
4. **`src/components/dashboard/ViewQuoteContent.tsx`** — `getPricingModelLabel` function
5. **`src/components/dashboard/BookingDetailsDialog.tsx`** — Any visible "Fixed Term" labels
6. **`src/components/EditQuoteForm.tsx`** — Radio label (~line 303)
7. **`src/components/AdvertisementSizeStep.tsx`** — Booking type display (~line 233)
8. **`src/components/DurationScheduleStep.tsx`** — Booking type display (~line 172)
9. **`src/components/FixedTermBasketSummary.tsx`** — Basket header and booking type text (~lines 109, 135, 339)
10. **`src/components/MobilePricingSummary.tsx`** — If it has "Fixed Term" labels

**Hooks / Data:**
11. **`src/hooks/useAdvertisingContent.ts`** — Default content strings (~lines 119, 121)

**Edge Functions (webhooks/emails/invoices):**
12. **`src/lib/webhookPayloadResolver.ts`** — Journey tag (~line 76)
13. **`supabase/functions/send-booking-webhook/index.ts`** — Display label (~line 45)
14. **`supabase/functions/generate-invoice/index.ts`** — Invoice campaign type (~lines 256, 396)
15. **`src/components/admin/EmailTemplatesManagement.tsx`** — Sample data strings (~lines 27, 36, 40)

### What stays unchanged
- Database `pricing_model` values (`'fixed'`, `'fixed_term'`) — no schema changes
- Internal variable/prop names like `fixedTermConfirmation`, `FixedTermBasketSummary`
- Code comments referencing the pricing model logic

