# Add Opening Hours Editor to Both Forms

Add an opening-hours editor to the admin `BusinessEditForm` (currently has none) and replace the freeform text-per-day editor in the user-facing `UserBusinessEditForm` with the same component, so both write the same shape. The Business Detail page already renders `opening_hours` via `OpeningHoursCard` — no detail-page changes needed; it will pick up edits automatically.

## Shape stored in `businesses.opening_hours` (JSON)

Keep one schema across forms and the public card:

```json
{
  "monday":    { "open": "09:00", "close": "17:00", "closed": false },
  "tuesday":   { "closed": true },
  ...
}
```

`OpeningHoursCard` and `isOpenNow` already handle this object shape and fall back to a string. Existing rows containing strings stay readable.

## New shared component

`src/components/directory/OpeningHoursEditor.tsx`
- 7 rows (Mon–Sun), each with: a "Closed" switch, an opening time `<input type="time">`, a closing time `<input type="time">`.
- "Copy to all" link on the first weekday row to apply Mon's hours to Tue–Fri.
- Emits the canonical object shape above via `onChange(value)`.
- Accepts legacy string values and parses `"9:00 - 17:00"` / `"Closed"` on first render so existing data is preserved.

## Files to change

- `src/components/admin/BusinessEditForm.tsx` — add an "Opening Hours" card (after the Images section) using `OpeningHoursEditor`, wired to `formData.opening_hours`.
- `src/components/dashboard/UserBusinessEditForm.tsx` — replace the existing text-input grid (lines ~393–419) with `OpeningHoursEditor`. Drop `openingHours` string-record state and the `handleHoursChange` helper; submit the editor's object directly under `opening_hours`. Migrate any string state on mount.
- New: `src/components/directory/OpeningHoursEditor.tsx`.

No detail-page changes (already renders correctly). No DB migration — `opening_hours` is already `jsonb`.

## Out of scope

- No new permissions or RLS changes.
- Detail page styling stays as just-redesigned.
- No timezone handling — times are stored as plain `HH:MM` strings, same as today.
