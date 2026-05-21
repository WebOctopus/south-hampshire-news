## Business Detail page — layout rebuild

Rewire `src/pages/BusinessDetail.tsx` to match the screenshot, using the directory components already built (`BusinessDetailHero`, `MeetTheOwnerCard`, `OpeningHoursCard`, `UnverifiedOverlay`, `BusinessIcon`). Keep current branding tokens (community-navy hero, community-green accents, cream cards, serif headings).

### Layout

```text
[ ← Back to Directory ]

┌──────────────────────────────────────────────────────┐
│ HERO  (navy, rounded)                                │
│ [icon]  VERIFIED chip                                │
│         Business Name (serif, large)                 │
│         Address line                                 │
│         Call · Mobile · Website · Email · Directions │
└──────────────────────────────────────────────────────┘

┌──────── LEFT (2fr) ────────┐   ┌──── RIGHT (1fr) ────┐
│ ABOUT card                  │   │ DETAILS card        │
│  description text           │   │  phone              │
│                             │   │  mobile             │
│ MEET THE OWNER card         │   │  website            │
│  avatar · name · role       │   │  email              │
│  pull-quote                 │   │  address            │
│                             │   ├─────────────────────┤
│                             │   │ OPENING HOURS card  │
│                             │   │  Mon … Sun rows     │
│                             │   │  "Open now" today   │
└─────────────────────────────┘   └─────────────────────┘

GALLERY  (full width)
[ Photo 1 ] [ Photo 2 ] [ Photo 3 ]
[ + Add  ] [ + Add  ] [ + Add  ]   ← only when owner/admin
```

Mobile: single column, hero first, then About, Details, Meet the owner, Opening hours, Gallery.

### Section details

- **Back link** — keep existing `Link` styling.
- **Hero** — use `BusinessDetailHero` as-is (already matches: navy panel, icon tile, VERIFIED chip, serif headline, address, contact icon row including Directions). Remove old mobile/desktop header blocks.
- **About card** — simple `Card` with "ABOUT" uppercase muted title + `Info` icon; body = `business.description`. Hidden if no description.
- **Meet the owner card** — render `MeetTheOwnerCard` with new owner fields from RPC. Already styled with avatar, name, role, orange quote bar.
- **Details card** — replaces the old Contact Information card. Phone, mobile (uses phone again for now — single field in schema), website (display hostname), email, address. Icon + value, value in `community-green`. Remove the "Sign in to view" gate per the spec ("contact details visible on full profile").
- **Opening hours card** — use `OpeningHoursCard` as-is.
- **Gallery** — new inline section. 3-col grid (1 col mobile, 2 md, 3 lg) of square tiles from `business.images` + `featured_image_url`. Each tile shows the image; empty slots show muted placeholder with `ImageIcon` + "Photo N". "Add photo" tiles only render when `user?.id === business.owner_id` or user is admin (use `useAuth().isAdmin`); they're disabled placeholders for now (upload wiring out of scope — opens `UserBusinessEditForm` gallery tab in a later pass).
- **Unverified state** — wrap the two-column body + gallery in a `relative` container; when `!business.is_verified`, dim children to ~60% opacity and overlay `UnverifiedOverlay`. The hero stays fully visible. `onClaim` scrolls to / triggers the existing `BusinessClaimButton` flow (keep that component mounted but visually hidden — used as the actual claim action).
- **Loading / not-found** — keep as-is.

### Files

- **Edit**: `src/pages/BusinessDetail.tsx` — replace render output with the new layout above. Add `owner_name`, `owner_role`, `owner_photo_url`, `owner_quote` to the local `Business` interface.
- **No new components**; reuse the directory pieces already created.
- **No DB changes** (migration from previous step already exposes the new fields).

### Out of scope

- Photo upload flow (Add photo tiles are visual-only placeholders for owner/admin).
- Claim flow changes — still uses existing `BusinessClaimButton`.
- No changes to RPC or other pages.

### Validation

- Verified business: hero, About, Meet owner (if data), Details, Opening hours with "Open now" highlight, gallery grid.
- Unverified business: same layout, dimmed, with centered "Apply to verify" overlay; clicking triggers the existing claim modal.
- Owner without `logo_url` but with `website` shows favicon in hero tile; without either → sector icon.
- Mobile stacks correctly; no horizontal scroll.
