# Fix directory search to match Business Type & Sector

## Problem
The keyword search on `/business-directory` rarely returns results because the
underlying `get_public_businesses` / `get_public_businesses_count` RPCs only
search `name`, `description`, `city`, `postcode`, and `keywords`. The two most
meaningful taxonomy fields on a listing — **Business Type** (`biz_type`) and
**Sector** (`sector`) — are not searched at all. So typing "Plumbing",
"Florists", "Cleaning", "Retail" etc. returns nothing even though many
businesses match.

The location gate is working as designed: a location must be selected before
the grid populates (anti-scraping). That stays.

## Fix
Update both RPCs to include `biz_type` and `sector` in the ILIKE search clause,
so a keyword now matches against the full hierarchy:

```text
name | description | sector | biz_type | city | postcode | keywords
```

This makes the search hierarchical in practice — a broad term like "Retail"
hits the sector level, a narrower term like "Florists" hits the business type
level, and free text still matches name/description/keywords.

Location filter is unchanged and continues to scope all matches to the chosen
edition area.

## Technical details
- Migration updates two functions:
  - `public.get_public_businesses(...)`
  - `public.get_public_businesses_count(...)`
- Both gain `OR b.sector ILIKE '%' || search_term || '%' OR b.biz_type ILIKE '%' || search_term || '%'` inside the existing search_term branch.
- No table changes, no RLS changes, no frontend changes required.

## Out of scope
- No change to the location-required gate.
- No change to the hero / pills / cards UI.
