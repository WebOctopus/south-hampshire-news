## Business Directory Front-end Redesign

Bring the public directory in line with the supplied four-page design. Two pages affected: `/business-directory` (list) and `/business/:slug` (detail). Admin and dashboard edit forms get a few new fields to support the detail page.

---

### 1. Hero + search (directory page)

- New dark hero panel:
  - Eyebrow pill: "DISCOVER DIRECTORY".
  - Headline (serif): "Find a local business, trade, class or community group in *your area*." (italic accent in primary/coral on "your area").
  - Subline: "Search on any keyword and select Location based on our Discover Magazine distribution areas. Both are required to tailor the result."
  - Search input (keyword) + Location select + Search button on a single row.
  - Helper line: "Keyword and location are both required to search."
- Below the hero:
  - **Sector pills row** — render from `business_categories` (icon + name). Clicking sets that category filter. Show ~6 most-used categories with "More ▾" for the rest.
  - **Location pills grid** — 14 area buttons (name + postcodes) sourced from `editionAreas`. Clicking sets the location filter. Selected state highlights the pill.

### 2. Verified businesses row (always visible)

- Heading "Verified businesses" with a green "VERIFIED" badge chip + "View all →" link (filters list to verified).
- Horizontal 3-card row (carousel on mobile) of `is_verified = true` businesses.
- Card layout (new `VerifiedBusinessCard`):
  - Top section (cream/off-white): square favicon-or-logo tile (left) + name + multi-line address (right). Small Discover bird icon below the favicon if `advertises_in_discover = true`.
  - Divider, then contact rows: phone, mobile, website, email (icon + value in primary colour).
  - Footer: sector chip (left) + "View →" link (right).

### 3. Recently added row (always visible)

- Heading "Recently added" + "See more →".
- Italic note: "These listings haven't yet been verified — contact details visible on their full profile."
- 3×2 grid of compact cards: name + sector chip (top), address, icon row for contact methods (no values shown), "View →".
- Source: most-recent `is_verified = false` businesses, limited to 6.

### 4. Full results grid

- Heading reflects active filters ("Results in Fareham" / "Food & drink in Southampton" / etc.) + result count.
- Existing pagination retained.
- Card switches to the verified style when `is_verified`, otherwise the recently-added compact style.
- Location is still required to load the full grid (existing anti-scraping rule preserved); Verified + Recently added rows are not gated.

### 5. Business detail page

- New dark hero band (full width inside container):
  - Square favicon/logo tile (left), name (serif) + address.
  - "VERIFIED" green chip (or muted "UNVERIFIED" chip).
  - Action row: Call · Mobile · Website · Email · Directions (icon + label). For unverified businesses these stay visible (no auth gate) per the design note.
- Two-column body below hero (stacks on mobile):
  - **Left column**: About card; Meet the owner card (avatar + name + role + pull-quote).
  - **Right column**: Details card (phone, mobile, website, email, address); Opening hours card with "Open now" highlight computed from current time.
- **Gallery section**: 3-column grid of photo tiles, "Add photo" tiles only shown to the owner/admin.
- **Unverified state**: whole body is rendered at ~60% opacity with a centred overlay card: "Apply to Verify This Business and Receive a Voucher Code to Advertise in Discover worth £100" + CTA button (links to existing claim flow).

### 6. Favicon as logo fallback

- Helper `getBusinessIconUrl(business)`:
  - Return `logo_url` if set.
  - Else if `website` set → `https://www.google.com/s2/favicons?domain={hostname}&sz=128`.
  - Else null — render the sector lucide icon inside the tile.
- `onError` swap to sector icon if the favicon 404s.

### 7. Database additions

New columns on `businesses`:
- `owner_name text`
- `owner_role text`
- `owner_photo_url text`
- `owner_quote text`
- `advertises_in_discover boolean default false`

Update RPCs to expose these:
- `get_public_businesses` (verified row + recently added need `advertises_in_discover`).
- `get_business_detail_by_slug` (needs all five new fields).
- New RPC `get_recently_added_businesses(limit_count int)` returning the latest unverified active businesses (no location filter).
- New RPC `get_verified_businesses(limit_count int)` returning featured-first verified businesses (no location filter).

### 8. Admin + dashboard edit forms

Add fields to `BusinessEditForm.tsx` and `UserBusinessEditForm.tsx`:
- "Advertises in Discover" toggle (admin only).
- "Owner name" / "Owner role" inputs.
- "Owner photo" image dropzone (re-uses business-images bucket).
- "Owner quote" textarea.

### 9. Out of scope

- No changes to the claim flow itself, voucher generation, GHL sync, search RPC keyword behaviour, or CSV importer.
- No new categories table; sector pills use existing `business_categories`.
- No reviews/ratings.

---

### Files to add

- `src/components/directory/DirectoryHero.tsx`
- `src/components/directory/SectorPills.tsx`
- `src/components/directory/LocationPillsGrid.tsx`
- `src/components/directory/VerifiedBusinessesRow.tsx`
- `src/components/directory/VerifiedBusinessCard.tsx`
- `src/components/directory/RecentlyAddedRow.tsx`
- `src/components/directory/RecentBusinessCard.tsx`
- `src/components/directory/BusinessDetailHero.tsx`
- `src/components/directory/MeetTheOwnerCard.tsx`
- `src/components/directory/OpeningHoursCard.tsx`
- `src/components/directory/UnverifiedOverlay.tsx`
- `src/lib/businessIcon.ts` (favicon helper + open-now util)

### Files to edit

- `src/pages/BusinessDirectory.tsx` — assemble new hero, pill rows, verified/recent rows above existing grid.
- `src/pages/BusinessDetail.tsx` — replace current layout with new hero + two-column body + gallery + unverified overlay.
- `src/components/BusinessCard.tsx` — switch to new compact style (or replace with `RecentBusinessCard`).
- `src/components/admin/BusinessEditForm.tsx` — new fields.
- `src/components/dashboard/UserBusinessEditForm.tsx` — new fields (excluding advertiser toggle).
- `supabase/migrations/*` — add columns + update/add 4 RPC functions.

---

### Validation

- Load `/business-directory` with no location selected → hero, pills, verified row and recently-added row all render; full results show "Select Your Area".
- Pick a location → results grid populates.
- Click "Verified" chip / "View all" → grid filters to verified.
- Verified detail page shows full layout, dark hero, contact icons, gallery.
- Unverified detail page renders faded with the "Apply to Verify" overlay; clicking opens claim flow.
- Business without `logo_url` but with `website` shows the website favicon in the tile; without either → sector icon.
- Admin edits owner + advertiser fields; changes visible on detail page after save.
