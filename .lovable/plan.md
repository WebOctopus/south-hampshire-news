

## Add Company Name Column & Search to Admin User Management

### 1. Database Migration

Add a `company` column to the `profiles` table and backfill from the most recent booking per user:

```sql
ALTER TABLE profiles ADD COLUMN company text;

UPDATE profiles p
SET company = b.company
FROM (
  SELECT DISTINCT ON (user_id) user_id, company
  FROM bookings
  WHERE company IS NOT NULL AND company != ''
  ORDER BY user_id, created_at DESC
) b
WHERE p.user_id = b.user_id;
```

### 2. Update Types

Add `company?: string` to the `profiles` Row/Insert/Update types in `src/integrations/supabase/types.ts`.

### 3. Update Admin User Table (`src/pages/AdminDashboard.tsx`)

**Add search state** (~line 62): Add `userSearchTerm` state variable.

**Add search input** (before the Table, ~line 724): Add an `<Input>` with placeholder "Search by display name..." that filters the user list.

**Filter users**: Apply the search filter on `users` before `.map()` — filter by `display_name` matching the search term (case-insensitive).

**Add "Company" column**:
- Add `<TableHead>Company</TableHead>` after the Display Name column header (line 728).
- Add `<TableCell>{u.company || '-'}</TableCell>` after the display name cell (line 743).

**Update edit dialog & save logic**: Add a "Company Name" input field to the user edit form and include `company` in the `updateUserAgencyInfo` save payload.

### What stays the same
- `loadUsers` already does `select('*')` on profiles, so the new `company` column will be fetched automatically.
- No RLS changes needed — existing profile policies cover this.

