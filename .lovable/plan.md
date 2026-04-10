

## Change "Organizer" to "Organiser" (British Spelling) in UI

### Problem
The UI displays "Organizer" (American spelling) but should use "Organiser" (British spelling) to match the UK audience.

### Scope
Change only **user-facing labels, placeholders, and comments** -- NOT the database column name (`organizer`) or the code variable names that map to it, since renaming the DB column would require a migration and could break queries.

### Changes

**1. `src/pages/AddEvent.tsx`**
- Label: `"Organizer *"` → `"Organiser *"`
- Placeholder: `"e.g. Local Community Group"` (no change needed)
- Validation toast if any mentions "organizer"

**2. `src/pages/Dashboard.tsx`**
- Label: `"Organizer"` → `"Organiser"`
- Placeholder: `"Event organizer"` → `"Event organiser"`

**3. `src/pages/EventDetail.tsx`**
- Comment: `{/* Organizer & Contact */}` → `{/* Organiser & Contact */}` (cosmetic)

**4. `supabase/functions/send-event-notification/index.ts`**
- Email HTML: `"👤 Organizer:"` → `"👤 Organiser:"`

All variable names (`formData.organizer`, `event.organizer`) stay unchanged as they map to the database column.

