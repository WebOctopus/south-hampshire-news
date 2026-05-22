## Improve owner assignment + Discover advertiser flag in admin Business edit form

Two changes to `src/components/admin/BusinessEditForm.tsx`:

### 1. "Advertises in Discover" toggle

Add a third row in the existing Admin Settings switch grid (next to Active / Verified / Featured) bound to the existing `advertises_in_discover` column on `businesses`. No schema work needed — the column already exists and powers the favicon on the directory cards.

### 2. Searchable owner dropdown

Replace the free-text "Owner User ID" input with a searchable combobox listing every registered user. Selecting a user sets `owner_id` to their `user_id`; a "No owner (unclaimed)" option clears it. Search matches display name, company, and email.

To get the data securely (admin reads of `auth.users` aren't possible from the client), add a new SECURITY DEFINER RPC:

```sql
CREATE OR REPLACE FUNCTION public.get_users_for_owner_assignment()
RETURNS TABLE(user_id uuid, display_name text, company text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.company, u.email::text
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY COALESCE(p.display_name, u.email) ASC;
$$;

REVOKE ALL ON FUNCTION public.get_users_for_owner_assignment() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_users_for_owner_assignment() TO authenticated;
```

The function returns an empty set for non-admins (the `has_role` check in the WHERE clause).

### UI details

- Use the existing shadcn `Popover` + `Command` pattern (already used elsewhere in the codebase) for the combobox — trigger button shows the currently selected user's display name + email, or "No owner (unclaimed)".
- Show display name as the primary label, with email and company as secondary text in each option.
- Keep the helper text "Leave empty for unclaimed businesses".

### Out of scope

No changes to the public-facing user dashboard form, the directory cards, or RLS policies on `businesses` (existing `owner_id = auth.uid()` policy already lets owners edit their own listing once assigned).
