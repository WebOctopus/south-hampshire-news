## Add Discover favicon before category tag on verified business cards

On the front directory page's "Verified businesses" row, each `VerifiedBusinessCard` will show the Discover favicon in the footer row, immediately before the category tag, whenever `advertises_in_discover` is true. This signals the business also advertises in Discover.

The existing favicon under the business logo (top-left) stays as-is.

### Changes

`src/components/directory/VerifiedBusinessCard.tsx`
- In the footer flex row (left side, where the category `Badge` lives), wrap the left side in a flex container.
- When `business.advertises_in_discover` is true, render `<img src="/favicon.svg">` (with `.png` fallback via `onError`) at ~20px, with `title`/`alt` "Advertises in Discover", placed before the category badge.
- If there's no category, the favicon still renders on its own.
- No other files or logic change.
