# Add Discover favicon icon next to “Advertises in Discover” on Featured listing cards

## Goal
When a business has `advertises_in_discover` enabled, show the Discover Magazine favicon beside the “Advertises in Discover” label on the directory listing card so the label stands out visually and is clearly tied to the Discover brand.

## Scope
- Update the **Featured listing card** in `src/components/directory/DirectoryResultCards.tsx` only.
- The **Verified** and **Recent** cards do not currently render this label, so no change there unless the user later requests it.

## Implementation
- Inside the card footer, where the `advertises_in_discover ?` span is rendered, add an `<img>` tag referencing the public favicon asset.
- Asset path: `/favicon.svg` (public asset, referenced absolutely).
- Icon size: 16 px (`h-4 w-4`), `object-contain`, with `alt="Discover Magazine"`.
- Layout: keep the existing `inline-flex` wrapper with a small gap between the favicon and the label text.
- Styling: keep the current orange-toned text colour (`text-orange-700/80`) and uppercase label; the favicon should sit on the same baseline and not alter the footer height.

## Result
Featured cards for businesses that advertise in Discover will display a small Discover logo/favicon before the “Advertises in Discover” text, reinforcing the brand association without changing the card layout or the Featured badge.
