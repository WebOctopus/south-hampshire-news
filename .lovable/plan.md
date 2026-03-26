

## Replace "3+ Repeat" with "3+ Subscription" Everywhere

**No database changes needed.** The database stores `'bogof'` as the internal pricing model key. "3+ Repeat" is purely a UI display string — no tables, columns, or stored data reference it.

### Files to update (24 files, ~214 occurrences)

Global find-and-replace of all variations:
- `"3+ Repeat Package"` → `"3+ Subscription Package"`
- `"3+ Repeat Package:"` → `"3+ Subscription Package:"`
- `"3+ Repeat"` → `"3+ Subscription"` (standalone uses)

**Client-side files:**
1. `src/components/AdvertisingStepForm.tsx`
2. `src/components/AreaAndScheduleStep.tsx`
3. `src/components/AreaSelectionStep.tsx`
4. `src/components/BookingSummaryStep.tsx`
5. `src/components/DurationScheduleStep.tsx`
6. `src/components/EditQuoteForm.tsx`
7. `src/components/FixedTermBasketSummary.tsx`
8. `src/components/MobilePricingSummary.tsx`
9. `src/components/NewAdvertiserPromo.tsx`
10. `src/components/PricingOptionsStep.tsx`
11. `src/components/QuickQuoteCalculator.tsx`
12. `src/components/SalesAssistantPopup.tsx`
13. `src/components/dashboard/BookingCard.tsx`
14. `src/components/dashboard/BookingDetailsDialog.tsx`
15. `src/components/dashboard/CreateBookingForm.tsx`
16. `src/components/dashboard/DeleteQuoteDialog.tsx`
17. `src/components/dashboard/QuoteConversionCard.tsx`
18. `src/components/dashboard/ViewQuoteContent.tsx`
19. `src/components/dashboard/VouchersSection.tsx`
20. `src/lib/webhookPayloadResolver.ts`

**Edge functions:**
21. `supabase/functions/send-booking-confirmation-email/index.ts`
22. `supabase/functions/send-booking-webhook/index.ts`
23. `supabase/functions/send-quote-booking-webhook/index.ts`
24. `supabase/functions/validate-bogof-eligibility/index.ts`

### Safety notes
- The `pricing_model` column in `bookings` and `quote_requests` stores `'bogof'` — this is untouched
- The `getJourneyTag` / `getPricingModelDisplay` functions map `'bogof'` → display string — only the display string changes
- No RLS policies, triggers, or DB functions reference "3+ Repeat"

