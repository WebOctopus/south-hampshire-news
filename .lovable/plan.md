## Update favicon to peacock branding

Use the uploaded SVG as the primary favicon, with the PNG as fallback for browsers that don't support SVG favicons.

### Steps

1. Copy the uploaded files into `public/`:
   - `user-uploads://Pcock.svg` → `public/favicon.svg`
   - `user-uploads://Pcock.png` → `public/favicon.png`
2. Remove the existing `public/favicon.ico` (browsers auto-request `/favicon.ico` and it would override the new one).
3. Update the favicon `<link>` tags in `index.html`:
   ```html
   <link rel="icon" type="image/svg+xml" href="/favicon.svg">
   <link rel="icon" type="image/png" href="/favicon.png">
   ```
   (Modern browsers pick the SVG; older ones fall back to the PNG.)

### Out of scope
- No changes to the OG image, app code, or branding elsewhere.
