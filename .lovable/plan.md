## Goal
Move Discount Codes and Reporting from the top-level Calculator Management Console tabs into the nested tabs inside Subscription Settings Management, where there's now room.

## Changes

1. **`src/components/admin/CostCalculatorManagement.tsx`**
   - Remove the `discountCodes` and `discountReporting` `TabsTrigger`s and their `TabsContent` blocks.
   - Change `TabsList` from `grid-cols-7` back to `grid-cols-5`.
   - Drop the now-unused imports: `DiscountCodesManagement`, `DiscountCodesReporting`, and the `Ticket` / `BarChart3` icons.

2. **`src/components/admin/SubscriptionSettingsManagement.tsx`**
   - Import `DiscountCodesManagement`, `DiscountCodesReporting`, and the `Ticket` + `BarChart3` icons.
   - Expand the nested `TabsList` from `grid-cols-3` to `grid-cols-5` and add two new triggers:
     - `discountCodes` — "Discount Codes" (Ticket icon)
     - `discountReporting` — "Reporting" (BarChart3 icon)
   - Add matching `TabsContent` blocks rendering `<DiscountCodesManagement />` and `<DiscountCodesReporting />`.
   - Update the header subtitle to mention discount codes & reporting alongside durations and volume discounts.

3. **No prop changes** — both child components are self-contained and don't need `onStatsUpdate`.

## Verification
- Admin → Cost Calculator Management top-level tabs: Locations, Ad Sizes & Pricing, Subscription Settings, Leaflets, Product Designer (5 tabs).
- Inside Subscription Settings: Durations, Volume Discounts, Payment Options, Discount Codes, Reporting (5 tabs), each renders its respective panel.
- Build passes with no unused imports.
