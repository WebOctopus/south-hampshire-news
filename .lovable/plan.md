# Directory data model migration

Adds the CRM match key and the new area/keyword tables that will back the redesigned business directory. Nothing existing is renamed or dropped, and `pricing_areas` / `leaflet_areas` are read once and never written to.

## What gets created

**1. `businesses.crm_company_id`**
New nullable text column with a unique index. This becomes the only match key for Mirola CRM imports — upserts key on it, never on business name.

**2. `directory_areas`**
The 14 magazine areas, keyed by `area_code` (1-14). Seeded from `pricing_areas` (`sort_order` -> `area_code`, `name` -> `internal_name`), which is read-only here. Postcodes come from the supplied list, not from `pricing_areas`.

Confirmed the 14 source rows exist with `sort_order` 1-14 ("Area 1 - SOUTHAMPTON" through "Area 14 - STOCKBRIDGE, WELLOWS & TEST VALLEY VILLAGES").

Postcode mapping seeded exactly as supplied, including the deliberate multi-area postcodes (SO18, SO31, SO40, SO51, SO52, PO17). A postcode search will later return businesses from every matching area.

Access: anyone can read active rows; admins have full access. `internal_name` is for the admin UI only and never surfaces publicly.

**3. `business_areas`**
Join table (`business_id`, `area_code`) so a business can sit in several areas. Admin-only under RLS — public reads will go through SECURITY DEFINER RPCs added in a later step.

**4. `keywords` + `business_keywords`**
`keywords` holds a unique `term` plus a `normalised_term` (lowercased, trimmed) for matching. `business_keywords` links them to a business with a `source` of either `crm` or `owner`.

Access rules on `business_keywords`:
- Admins: full access.
- A verified business owner: may add and remove rows for their own business, and only rows they added themselves (`source = 'owner'`). CRM-imported keywords cannot be touched by owners.

## Not in this change

- No column is renamed or dropped. `edition_area`, `sector`, `biz_type`, `category_id` and `tag` all stay until the new import is proven.
- No writes to `pricing_areas` or `leaflet_areas`; their postcode mappings stay as they are.
- No front-end or RPC changes yet — this is schema only.

## Technical notes

Migration order per new table: CREATE TABLE, GRANT (authenticated/service_role; anon SELECT only on `directory_areas`), ENABLE ROW LEVEL SECURITY, CREATE POLICY. Postcode arrays are stored as `text[]` on `directory_areas` and seeded with a single UPDATE per area built from the supplied postcode -> area list. `updated_at` on `directory_areas` uses the existing `public.update_updated_at_column()` trigger function. Owner policies on `business_keywords` use an EXISTS check against `businesses` (`owner_id = auth.uid() AND is_verified = true`) combined with `source = 'owner'`; admin policies use `has_role(auth.uid(),'admin')`.
