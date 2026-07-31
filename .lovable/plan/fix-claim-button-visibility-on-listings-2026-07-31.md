# Fix claim button visibility on listings

The claim button currently hides whenever any claim row exists for the listing, which reimposes a constraint the database no longer has. The database only blocks a second *pending* claim by the *same* user (partial unique index `uniq_pending_claim_per_business_user`, confirmed on `business_claim_requests`). The UI should match that.

## Correct behaviour

Listing unowned (`owner_id` is null):
- This user has a pending claim -> "Your claim is under review", button disabled
- This user has a rejected claim -> show the claim button (they may re-apply)
- Someone else has a pending claim -> still show the claim button; admin adjudicates
- No claim -> show the claim button

Listing owned (`owner_id` is not null):
- No claim button
- Show "This listing is managed by its owner" with a link to the contact page

## Changes

`src/components/BusinessClaimButton.tsx`
- Replace the "any existing claim" lookup with a query scoped to the signed-in user only, newest first, one row: `.eq('business_id', ...).eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()`. Other users' claims are never consulted.
- Derive a single flag from the latest own claim: only status `pending` (or `approved`) suppresses the button. Nothing else does.
- Own `rejected` claim: render the normal claim trigger so they can re-apply, with a short note that the previous claim was rejected.
- Owned listing (`ownerId` set): instead of returning `null`, render a short notice "This listing is managed by its owner" with a link to `/contact`, so a genuine owner whose business was wrongly claimed has somewhere to go. `hideWhenPending` continues to keep the hero compact for the pending state.

`src/components/directory/BusinessDetailHero.tsx`
- It currently renders the claim component only when `!business.is_verified`. Render it unconditionally so the owned-listing notice and the re-apply path are reachable; the component itself decides what to show.

No database or RPC changes — the constraint is already correct.