# Redesign Business Detail Page

Lift the visual layout from the uploaded mock (`discover-directory-page3_1.html`) and apply it to `/business/:slug`. All current behaviour — claim flow, verified-only content gating, gallery upload for owners/admins, opening hours "open now", directions/website/email/phone actions — stays exactly as is. Only markup, spacing, and styling change.

## Layout Structure (matching the mock)

```text
Navigation (existing)
Breadcrumb: Directory > Search results > {Business name}
Hero band (teal background, full-width)
  ┌─────────────────────────────────────────────────────┐
  │ [Logo 80px]  Badges (Verified / Advertises)         │
  │              Business Name (serif, large)            │
  │              Tagline / address                       │
  │              [Call] [Website] [Email] [Directions]   │
  │              [verify-cta pill if unverified]         │
  └─────────────────────────────────────────────────────┘
Two-column body (2fr / 1fr)
  Left:  About card · Meet the owner card
  Right: Details card · Opening hours card
Gallery section (full width, 3-col grid)
Footer (existing)
```

## Visual Language

Map mock values to existing semantic tokens — no new hard-coded colours in components:
- Hero background → `community-green` (teal already in palette)
- Card borders → soft teal tint (use `border-community-green/20` or extend `--card-border` token in `index.css`)
- Accent purple for owner quote bar & verify pill → existing `community-purple` token (extend in `index.css`/`tailwind.config.ts` if not already present)
- Headings → existing `font-heading` (serif)
- Body → existing sans
- Card titles: small uppercase, tracked, muted, with small teal icon

## Files to Change

- `src/pages/BusinessDetail.tsx` — replace outer layout with breadcrumb + hero band + 2-col body + gallery section. Keep data fetching, `canManage`, gallery slot logic, unverified overlay/claim, all handlers untouched.
- `src/components/directory/BusinessDetailHero.tsx` — restyle to the teal hero band with badges row, serif name, tagline, and a horizontal action button row (Call / Website / Email / Directions). Same props, same conditional rendering.
- `src/components/directory/MeetTheOwnerCard.tsx` — restyle: round avatar, name, role, purple left-border quote with serif italic. Same props.
- `src/components/directory/OpeningHoursCard.tsx` — restyle rows to match mock (day left muted, hours right, "Open now" in teal). Same logic.
- New small component `src/components/directory/BusinessDetailsCard.tsx` — extracts the Details card (phone, mobile, website, email, address) from `BusinessDetail.tsx` so the page file stays tidy. Same fields, same links.
- `src/index.css` / `tailwind.config.ts` — add any missing tokens (soft-teal card border, community-purple accent) if not already defined. No raw hex in components.

## Functionality Preserved

- Slug fetch via `get_business_detail_by_slug` RPC
- Owner/admin detection (`canManage`) and gallery edit affordance (existing upload integration stays)
- Unverified state: content dimmed + `BusinessClaimButton` overlay
- Opening-hours "open now" indicator
- All `tel:`, `mailto:`, `https://` and Google Maps directions links

## Out of Scope

- Editor forms (admin/dashboard) untouched
- No data model or RPC changes
- No new images uploaded; mock's icon font replaced with existing lucide icons
