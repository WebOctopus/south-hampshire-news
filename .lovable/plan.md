# Social icons on Featured listing cards

Add a clickable row of social icons to the Featured card in the directory search results, matching the badge strip already used on the public listing page.

## What changes

- Featured cards show a small icon strip (Facebook, Instagram, X, LinkedIn, TikTok, YouTube, Checkatrade) for whichever links the listing has set.
- Each icon opens the relevant profile in a new tab, and clicking an icon does not also navigate to the listing page.
- Cards with no social links look exactly as they do now — no empty strip.
- Verified and Recent cards are unchanged.

## Technical notes

1. Database: `get_public_businesses_v2` currently returns no social columns, so the search results carry no link data. A migration recreates it (and its signature stays the same) with `facebook_url`, `instagram_url`, `twitter_url`, `linkedin_url`, `tiktok_url`, `youtube_url`, `checkatrade_url` appended to the returned columns. No table or column is renamed, dropped, or altered; area/internal names remain unexposed.
2. Extract the icon strip currently inside `src/components/directory/BusinessDetailsCard.tsx` into a shared `SocialLinks` component (with `size`/compact variant) so the card and the detail page render the same set, including the Checkatrade logo asset.
3. `src/components/directory/DirectoryResultCards.tsx`: extend `DirectoryBusiness` with the social fields and render `SocialLinks` in the Featured card body, above the footer. Each link uses `target="_blank"`, `rel="noreferrer"`, an `aria-label`, and `stopPropagation` on click so the card's navigate handler doesn't fire.
4. Verify with a directory search for a Featured listing that has social links set, checking the icons render and open correctly.
