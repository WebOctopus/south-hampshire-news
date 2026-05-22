# Make Location dropdown type-searchable

Replace the native `Select` in `DirectoryHero.tsx` with a searchable combobox (Popover + Command from shadcn) so the user can type to filter locations, matching the behaviour of the business-owner dropdown added earlier.

## UX

- Same trigger styling as today: white pill, map-pin icon, "Your location" placeholder, chevron.
- Clicking opens a popover containing a `Command` with:
  - `CommandInput` placeholder: "Search location or postcode..."
  - `CommandEmpty`: "No matching area."
  - `CommandGroup` listing every option (including "Your location" reset row).
- Each item shows `cleanAreaName(loc)`. The searchable value combines the cleaned name **and** the raw string so typing a postcode (e.g. "SO31") still matches.
- Selecting an item closes the popover and calls `onLocationChange(loc)`.
- Width and height unchanged (`w-full md:w-64 h-14`), keyboard navigation works via Command.

## Technical details

- File: `src/components/directory/DirectoryHero.tsx` only. No prop changes — parent still passes `locations`, `selectedLocation`, `onLocationChange`, `cleanAreaName`.
- Use existing `@/components/ui/popover` and `@/components/ui/command` primitives (already in project).
- Local state: `const [open, setOpen] = useState(false)`.
- Trigger button mirrors current select styling; show selected label or "Your location".
- Items use `value={`${cleanAreaName(loc)} ${loc}`}` so Command's built-in fuzzy filter matches both display name and postcode tokens.
- No DB, RPC, or other component changes.
# Filter Verified + Recently Added rows by search criteria

Make the "Verified businesses" and "Recently added" rows on `/business-directory` respect the current search term, sector, location, and tag — so they show only matching businesses (or nothing if no matches).

## Database

Update two `SECURITY DEFINER` RPCs to accept the same filter parameters used by `get_public_businesses` (all optional, defaulting to NULL so existing callers still work):

- `get_verified_businesses(limit_count, search_term, category_filter, edition_area_filter, tag_filter)`
- `get_recently_added_businesses(limit_count, search_term, category_filter, edition_area_filter, tag_filter)`

Filtering logic mirrors `get_public_businesses`:
- `search_term`: case-insensitive match on name / description / city / postcode / keywords.
- `category_filter` (uuid): exact `category_id`.
- `edition_area_filter` (text): exact `edition_area`.
- `tag_filter` (text): exact `tag`.

`get_verified_businesses` keeps its existing `is_verified = true` constraint and `featured DESC, updated_at DESC` ordering. `get_recently_added_businesses` keeps `is_verified = false` and `created_at DESC` ordering.

## Frontend

- `VerifiedBusinessesRow.tsx` and `RecentlyAddedRow.tsx`
  - Accept new props: `searchTerm`, `categoryId`, `editionArea`, `tag`.
  - Re-fetch (with a stale-request guard) whenever those props change, passing them through to the RPCs.
  - Hide the section entirely when the filtered result is empty (already the behaviour — keep it).

- `src/pages/BusinessDirectory.tsx`
  - Pass the current `searchTerm`, `selectedCategory`, `selectedLocation`, `selectedTag` (mapping `'all'` → `undefined`) into both row components.

No other components change. The previous changes (advertiser toggle, owner dropdown, favicon placement) stay in place.

Two improvements to `src/components/admin/BusinessEditForm.tsx` Admin Settings panel.

## 1. Add "Advertises in Discover" toggle

The Discover favicon on directory cards / hero is driven by the `advertises_in_discover` boolean on the business row. There is currently no UI for it in the edit form (it's confused with the Owner ID field).

- Add a fourth toggle next to Active / Verified / Featured labelled "Advertises in Discover", bound to `formData.advertises_in_discover`.
- Add the field to the form's state initialisation and to the save payload.
- Change the admin settings grid from `md:grid-cols-3` to `md:grid-cols-2` (or `md:grid-cols-4`) so the four toggles wrap cleanly.

## 2. Replace Owner UUID input with searchable user dropdown

The "Owner User ID" text field currently requires pasting a UUID. Replace it with a searchable combobox listing all users (display name / company / email), so admins can pick an owner by name.

- Fetch the user list once on mount via the existing `admin-manage-user` edge function (`action: 'list_users_with_email'`) — the same call already used by `AdminDashboard.tsx`.
- Render a shadcn `Popover` + `Command` combobox (the standard searchable select pattern). Search matches against display name, company, and email.
- Selecting a user sets `formData.owner_id` to that user's id; a "Clear / Unassigned" option resets it to empty.
- Show the currently selected user's name + email in the trigger; if `owner_id` exists but isn't in the list (edge case), fall back to showing the raw id.
- Keep the helper text: "Leave empty for unclaimed businesses."

No database/schema changes needed — the column already exists and the edge function already returns users with emails.

The favicon was already added under the logo on `VerifiedBusinessCard`, but it only renders when `advertises_in_discover` is true — so on cards where that flag is false it doesn't appear. The user wants it more prominently shown on cards in the "Verified businesses" row to indicate the business advertises in Discover.

## Changes

`src/components/directory/VerifiedBusinessCard.tsx`

- Keep the existing favicon under the business logo (top-left of the card).
- Additionally, in the footer row (where the category tag sits), render the Discover favicon (≈18px) immediately before the category tag when `advertises_in_discover` is true, with tooltip/alt "Advertises in Discover".
- No styling changes elsewhere; the footer remains a flex row with the favicon + tag on the left and the "View" link on the right.

Only `advertises_in_discover === true` triggers the icon — businesses that don't advertise in Discover won't show it.
# Double the hero logo tile size

Change `BusinessDetailHero.tsx` so the `BusinessIcon` size prop goes from `80` to `160` (double). Keep the rounded-2xl tile styling and existing layout — the hero row already flex-wraps, so the larger logo will sit beside the heading on desktop and stack above on mobile.

No other components change. `BusinessIcon` already requests a 256px favicon and uses `object-contain`, so it will render crisply at the larger size.
