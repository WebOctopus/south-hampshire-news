

## Plan: Professional Business Search with Predictive Filtering

### Overview

Transform the Business Management search from a basic text input requiring a button click into a professional autocomplete search that shows matching businesses as you type. This will use the existing `Popover` + `Command` (cmdk) components already established in the codebase, with optimizations for the large dataset (18,778+ businesses).

---

### Current State

- Simple `Input` field with "Search" and "Clear" buttons
- Requires clicking "Search" to execute the filter
- No visual feedback or predictions as user types
- Backend query uses `ilike` pattern matching

### Proposed Solution

Replace the current input with a searchable combobox that:
1. Shows a dropdown of matching businesses as you type
2. Performs client-side filtering for instant feedback
3. Debounces the search query to avoid excessive API calls
4. Shows business metadata (category, location) in suggestions
5. Allows selecting a business to filter the table to that single result

---

### Implementation Steps

**Step 1: Add State Variables**

Add new state for the search popover:
- `searchOpen` - controls popover visibility
- `debouncedSearchTerm` - debounced version of search input
- `searchSuggestions` - array of matching businesses for dropdown

**Step 2: Create Debounced Search Query**

Add a debounced query that fetches matching businesses as user types:
- Use `setTimeout` or a debounce hook with ~300ms delay
- Query businesses table with `ilike` filter
- Limit results to 20-50 suggestions for performance

**Step 3: Replace Search Input with Combobox**

Transform the search section (lines 381-403) to use:
- `Popover` + `PopoverTrigger` + `PopoverContent`
- `Command` + `CommandInput` + `CommandList` + `CommandGroup` + `CommandItem`
- Show business name, category badge, and location in each suggestion
- Keyboard navigation support (built into cmdk)

**Step 4: Selection Behavior**

When user selects a suggestion:
- Set the search term to the selected business name
- Close the popover
- Trigger the table filter (existing logic)

**Step 5: Enhance Visual Design**

- Show loading spinner while fetching suggestions
- Display "No results found" when search yields nothing
- Show business category and location in suggestions
- Add clear button inside the search input

---

### Architecture Diagram

```text
+------------------------------------------+
|  Business Search Combobox                |
|  +------------------------------------+  |
|  | [Search icon] Type to search...   |  |
|  +------------------------------------+  |
|  | Suggestions Dropdown               |  |
|  | +--------------------------------+ |  |
|  | | DJ Summers Plumbing            | |  |
|  | | [Services] • Southampton       | |  |
|  | +--------------------------------+ |  |
|  | | Flair Interiors                | |  |
|  | | [Home] • Christchurch          | |  |
|  | +--------------------------------+ |  |
|  | | ...more suggestions            | |  |
|  | +--------------------------------+ |  |
|  +------------------------------------+  |
+------------------------------------------+
```

---

### Technical Details

**Database Query (Server-side filtering)**
```sql
-- Optimized query for suggestions (max 20 results)
SELECT id, name, city, postcode, 
       business_categories.name as category
FROM businesses
WHERE name ILIKE '%search_term%'
   OR email ILIKE '%search_term%'
   OR postcode ILIKE '%search_term%'
   OR city ILIKE '%search_term%'
ORDER BY name ASC
LIMIT 20
```

**Component Structure**
```text
AdminDashboard.tsx
├── businessSearchOpen (state)
├── searchSuggestions (state via useQuery)
└── Search UI
    ├── Popover
    │   ├── PopoverTrigger (Button styled as input)
    │   └── PopoverContent
    │       └── Command
    │           ├── CommandInput (actual text input)
    │           ├── CommandList
    │           │   ├── CommandEmpty (no results)
    │           │   └── CommandGroup
    │           │       └── CommandItem (for each suggestion)
    │           └── Loading spinner (conditional)
    ├── Clear Button
    └── Add Business Button
```

**Key Features:**
- Fuzzy matching on name, email, postcode, city
- Shows category and location in dropdown
- Debounced API calls (300ms delay)
- Keyboard accessible (arrow keys, Enter, Escape)
- Click outside closes dropdown
- Selecting shows filtered table with that business

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AdminDashboard.tsx` | Add search combobox UI, debounced query hook, suggestion state |

### Dependencies

No new dependencies required - uses existing:
- `@radix-ui/react-popover` (already installed)
- `cmdk` (already installed)
- Existing `Command` and `Popover` UI components

---

### Performance Considerations

- **Debouncing**: 300ms delay prevents API calls on every keystroke
- **Limit Results**: Show max 20 suggestions in dropdown
- **Index Usage**: Existing database queries use `ilike` which works with GIN indexes if available
- **Client Filtering**: The Command component filters displayed items client-side after initial load

