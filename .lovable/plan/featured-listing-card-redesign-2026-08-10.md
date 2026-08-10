# Featured listing card redesign

Use **Gair Home Services** (`/business/gair-home-services`) as the reference listing while building — it is the one Featured business with a real photo, a logo and an About paragraph, so it shows the card at its best.

## What changes

The Featured card in directory search results gets a distinct, premium treatment so it clearly outranks Verified and unclaimed listings, and it uses the business photo as an integral part of the design rather than a bolted-on thumbnail.

New Featured card structure (two per row, as today):

```text
+--------------------------------------------------+
|  [ photo, full-bleed banner, 16:9 ]              |
|  gradient scrim at the bottom                    |
|  [logo tile]  FEATURED pill (top-left overlay)   |
+--------------------------------------------------+
|  Business name (large)                            |
|  Chandlers Ford, Eastleigh, SO53 1EZ              |
|  Two-line About extract                           |
|  globe  gairhomeservices.co.uk                    |
+--------------------------------------------------+
|  Advertises in Discover        View listing  ->   |
+--------------------------------------------------+
```

Details:
- Warm accent border and a soft lift on hover; photo scales very slightly on hover so it feels alive, not sticker-like.
- Logo sits in a white rounded tile that overlaps the bottom edge of the photo, which visually joins image and text instead of stacking two separate blocks.
- FEATURED pill sits over the photo, top-left, on a translucent dark chip.

## Image source and fallbacks

Priority for the card image:
1. First image in the gallery (`images[0]`)
2. `featured_image_url` — this is what Gair actually has today
3. No photo: the card falls back to a branded panel of the same height (tinted gradient with the logo, or the business initial when there is no logo), so every Featured card in a row stays the same height and none look broken.

## Technical notes

- Edit `src/components/directory/DirectoryResultCards.tsx` (`FeaturedResultCard`) only; the Verified and unclaimed cards and `TieredResultsList` stay as they are.
- `DirectoryBusiness` gains `featured_image_url` and `advertises_in_discover`; both are already returned by `get_public_businesses_v2`, so no database or RPC change is needed.
- All colours come from existing semantic tokens / the current orange accent classes already used in these cards.
- Verify against the live search results for a term that returns Gair Home Services, plus a Featured business with no image, to confirm both states.
