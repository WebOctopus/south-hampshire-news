# Searchable Location dropdown

Replace the native Select used for "Your location" in the directory hero with a type-to-search combobox, so users can start typing an area name or postcode (e.g. "SO31", "Winchester") and have the list filter live.

## Scope

- File: `src/components/directory/DirectoryHero.tsx` only.
- No changes to props, parent component, RPCs, or other rows.

## UX

- Trigger keeps current styling: white pill, map-pin icon, chevron, `w-full md:w-64 h-14`, placeholder "Your location".
- Clicking the trigger opens a popover containing a search input plus a scrollable list of all locations.
- Search input placeholder: "Search area or postcode...".
- Filtering matches against both the cleaned area name and the raw string, so postcode tokens like "SO31" still match.
- Selecting an item closes the popover and updates the location. A "Your location" reset row clears the filter back to "all".
- Empty state: "No matching area."
- Keyboard navigation (arrow keys, enter, escape) works.

## Technical details

- Use existing shadcn primitives already in the project: `@/components/ui/popover` (Popover/PopoverTrigger/PopoverContent) and `@/components/ui/command` (Command/CommandInput/CommandEmpty/CommandGroup/CommandItem).
- Local state in `DirectoryHero`: `const [open, setOpen] = useState(false)`.
- Each `CommandItem` uses `value={`${cleanAreaName(loc)} ${loc}`}` so Command's built-in fuzzy filter matches both the display name and the raw postcode tokens.
- Trigger is a `Button` styled to match the previous `SelectTrigger`; displays selected `cleanAreaName(selectedLocation)` or the placeholder.
