## Goal
Tidy the Cost Calculator Management console by removing the now-redundant "Special Deals" area, since its role is replaced by the new Discount Codes + Reporting features.

## Current state
- Top-level tabs in `CostCalculatorManagement.tsx` already include: Locations, Ad Sizes & Pricing, Subscription Settings, Leaflets, Product Designer, **Discount Codes**, **Reporting**.
- Inside the **Subscription Settings** tab (`SubscriptionSettingsManagement.tsx`) there are nested tabs: Durations, Volume Discounts, **Special Deals**, Payment Options.
- A standalone `SpecialDealsManagement.tsx` component also exists but is not referenced anywhere else.

## Changes

1. **`src/components/admin/SubscriptionSettingsManagement.tsx`**
   - Remove the nested "Special Deals" tab trigger and its `TabsContent` block.
   - Change `TabsList` from `grid-cols-4` to `grid-cols-3`.
   - Remove related state, queries, form, dialog, and handlers tied to `specialDeals` / `SpecialDeal` so the file stays clean (interface, `useState`, the special-deals branch of the parallel `loadData` fetch, dialog open/close state, edit/save/delete handlers, form state).
   - Update the header subtitle from "…volume discounts, and special deals" to "…and volume discounts".
   - Drop the now-unused `Gift` icon import.

2. **`src/components/admin/SpecialDealsManagement.tsx`**
   - Delete the file (no remaining references in `src/`).

3. **No changes** to top-level tabs in `CostCalculatorManagement.tsx` — Discount Codes and Reporting already live there.

## Out of scope
- No DB / migration changes. The `special_deals` table and any data stay untouched; only the admin UI for managing them is removed. If you'd like the table dropped too, say the word and I'll add a migration.

## Verification
- Open Admin → Cost Calculator Management → Subscription Settings: only Durations / Volume Discounts / Payment Options tabs render.
- Top-level Discount Codes and Reporting tabs continue to work.
- Build passes with no unused imports.
