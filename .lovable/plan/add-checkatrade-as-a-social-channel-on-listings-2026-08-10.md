# Add Checkatrade as a social channel on listings

## What changes

- Business editing forms (admin and owner dashboard) gain a "Checkatrade" field alongside Facebook, Instagram, X, LinkedIn, TikTok and YouTube.
- On the public listing page, when a Checkatrade URL is set, the Checkatrade logo appears in the social badge strip, styled to match the existing circular icon buttons.
- Listings without a Checkatrade URL are unchanged — no empty badge.

## Technical notes

1. Migration: add `checkatrade_url text` to `public.businesses` (nullable, no default). No column renamed or dropped.
2. Update the directory detail RPCs `get_business_detail_v2` and `get_business_detail_by_slug_v2` to include `checkatrade_url` in their return set, keeping the existing SECURITY DEFINER pattern and `is_active`/`suppressed` filtering.
3. Frontend:
   - `src/components/admin/BusinessEditForm.tsx` and `src/components/dashboard/UserBusinessEditForm.tsx`: add the field to form state and the Social Media Links grid, placeholder `https://www.checkatrade.com/trades/yourbusiness`.
   - `src/pages/BusinessDetail.tsx`: add `checkatrade_url` to the business type and pass it through.
   - `src/components/directory/BusinessDetailsCard.tsx`: add a Checkatrade entry to the `socials` array. Lucide has no Checkatrade icon, so the uploaded Checkatrade mark is uploaded as a CDN asset and rendered as an `<img>` inside the same circular badge, with `aria-label`/`title` "Checkatrade". The badge uses a white/neutral background so the red-and-navy logo stays legible instead of the teal hover fill used for the monochrome icons.
4. Types regenerate from the database automatically after the migration.

## Not included

No Checkatrade badge on the search result cards — only the detail page social strip, matching the other channels. Say the word if you want it on the cards too.
