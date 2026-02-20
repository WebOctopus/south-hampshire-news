
## Add Separate Quote Email Templates for Fixed Term, 3+ Repeat, and Leafleting

### The Problem

Currently there are two customer-facing templates: one for bookings and one for quotes — but both are shared across all three product types (Fixed Term, 3+ Repeat Package, Leafleting). Each product type has meaningfully different information to communicate to the customer, so they need separate templates.

### What Will Change

#### 1. Database — 6 new email templates (via SQL insert)

Six new templates will be inserted into `email_templates` — one customer quote template and one customer booking template per product type:

| Template Name | Display Name |
|---|---|
| `quote_fixed_customer` | Quote Saved — Fixed Term (Customer) |
| `quote_bogof_customer` | Quote Saved — 3+ Repeat Package (Customer) |
| `quote_leafleting_customer` | Quote Saved — Leafleting (Customer) |
| `booking_fixed_customer` | Booking Confirmation — Fixed Term (Customer) |
| `booking_bogof_customer` | Booking Confirmation — 3+ Repeat Package (Customer) |
| `booking_leafleting_customer` | Booking Confirmation — Leafleting (Customer) |

Each template will have appropriate variables:

- **Fixed Term**: `customer_name`, `ad_size`, `duration`, `circulation`, `total_cost`, `monthly_price`, `duration_discount`, `dashboard_url`
- **3+ Repeat (bogof)**: `customer_name`, `ad_size`, `paid_areas`, `free_areas`, `total_circulation`, `total_cost`, `monthly_price`, `dashboard_url`
- **Leafleting**: `customer_name`, `leaflet_size`, `number_of_areas`, `distribution_start`, `total_cost`, `dashboard_url`

The existing `quote_saved_customer` and `booking_confirmation_customer` templates are kept as generic fallbacks.

#### 2. Edge Function — `send-booking-confirmation-email/index.ts`

The template selection logic will be updated. Currently:
```
templateName = record_type === "booking"
  ? "booking_confirmation_customer"
  : "quote_saved_customer"
```

It will become:
```
templateName = `${record_type}_${pricing_model}_customer`
// e.g. "quote_fixed_customer", "booking_leafleting_customer"
// Falls back to generic template if specific one not found
```

The variable map passed to `applyTemplate` will also be expanded per product type to populate leafleting- and bogof-specific variables like `leaflet_size`, `distribution_start`, `paid_areas`, `free_areas`, `monthly_price`, `duration_discount`.

#### 3. Admin UI — `EmailTemplatesManagement.tsx`

- Add new sample data entries for the new variables so the live preview works correctly:
  - `leaflet_size`, `number_of_areas`, `distribution_start`, `paid_areas`, `free_areas`, `monthly_price`, `duration_discount`
- Templates will automatically appear in the existing table — no structural UI change needed

### How It Works End-to-End

```text
User submits quote (pricing_model = "fixed")
  └─> Edge function called with { record_type: "quote", pricing_model: "fixed" }
       └─> Looks up "quote_fixed_customer" in DB
            └─> Found? Use it with fixed-specific variables
            └─> Not found? Fall back to "quote_saved_customer" generic template

User submits quote (pricing_model = "leafleting")
  └─> Edge function called with { record_type: "quote", pricing_model: "leafleting" }
       └─> Looks up "quote_leafleting_customer" in DB
            └─> Found? Use it with leafleting-specific variables (leaflet_size, areas, dates)
```

### No Breaking Changes

- The admin notification template (`booking_quote_admin`) is unchanged — it already shows all fields dynamically
- The existing generic templates remain as fallbacks
- All current bookings and quotes continue to work unchanged
- The 6 new templates appear in the admin Email Templates list and are immediately editable
