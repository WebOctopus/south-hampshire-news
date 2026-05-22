# Sharpen the business hero logo

## Cause
On the business detail hero, the icon tile renders a favicon-fallback image. We request it from Google at `size * 2` (160px for the 80px hero tile) and display it with `object-cover`, which crops/upscales a small bitmap and looks blurry.

## Changes

`src/components/directory/BusinessIcon.tsx`
- Request a higher-resolution source: clamp the requested favicon/logo size to at least 256px (Google's largest reliable size) regardless of the displayed `size` prop, so the bitmap is downscaled rather than upscaled.
- Switch the `<img>` from `object-cover` to `object-contain` so non-square logos aren't cropped and upscaled.
- Add `loading="eager"` and a subtle inner padding for favicon-style logos so they don't bleed to the rounded edge.

`src/lib/businessIcon.ts`
- In `getFaviconUrl`, request `sz=256` (cap input to 256) so Google returns the highest available resolution.

## Out of scope
- Business detail layout, claim button, details card.
