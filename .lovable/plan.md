

## Two Issues in Dashboard "Your Saved Quotes"

### Issue 1: Campaign Type shows "Bogof" instead of proper display name

**Location**: `src/pages/Dashboard.tsx`, lines 1233-1237

The table displays raw `pricing_model` values with only basic mapping. "bogof" shows as "Bogof" instead of "3+ Repeat Package for New Advertisers".

**Fix**: Update the display mapping:
```typescript
{quote.pricing_model === 'bogof' ? '3+ Repeat Package for New Advertisers' : 
 quote.pricing_model === 'fixed' ? 'Fixed Term' :
 quote.pricing_model === 'leafleting' ? 'Leafleting' : 
 quote.pricing_model}
```
Also update the same mapping in `QuoteConversionCard.tsx` (line 53) where `getPricingModelDisplay` returns `'3+ Repeat Package'` — change to `'3+ Repeat Package for New Advertisers'`.

### Issue 2: View dialog shows no info (uses wrong column names)

**Location**: `src/pages/Dashboard.tsx`, lines 1516-1581

The View Quote dialog references columns that don't exist in the `quotes` table:
- `viewingQuote.campaign_type` → should be `viewingQuote.pricing_model`
- `viewingQuote.total_cost` → should be `viewingQuote.final_total`
- `viewingQuote.advert_size` → should use `ad_size_id` (needs lookup or stored name)
- `viewingQuote.locations` → should use `selected_area_ids` / `bogof_paid_area_ids` / `bogof_free_area_ids`
- `viewingQuote.quantity` → should be `total_circulation`
- `viewingQuote.contact_email` → doesn't exist, use `email`
- `viewingQuote.contact_phone` → doesn't exist, use `phone`
- `viewingQuote.company_name` → doesn't exist, use `company`

**Fix**: Rewrite the View dialog to use correct column names and the same display name mapping. Show: pricing model, status, monthly price, final total (+ VAT), total circulation, contact info (name, email, phone, company), and created date.

### Files Changed

| File | Change |
|---|---|
| `src/pages/Dashboard.tsx` | Lines 1233-1237: Fix campaign type display name for bogof. Lines 1516-1581: Rewrite View dialog to use correct quote column names |
| `src/components/dashboard/QuoteConversionCard.tsx` | Line 53: Update bogof display name to "3+ Repeat Package for New Advertisers" |

