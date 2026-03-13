

## Admin User Management: Delete Users, Set Passwords, Role Assignment

### What We'll Build

Expand the User Management section in the admin dashboard with three new capabilities:

1. **Delete User** -- Admin can delete a user account entirely (removes from `auth.users`, which cascades to `profiles`, `user_roles`, bookings, quotes, etc.)
2. **Set/Reset Password** -- Admin can set a specific password for a user (useful for onboarding or support)
3. **Role Management** -- Admin can promote/demote users (admin vs regular user) directly from the edit dialog

All of these operations require the Supabase Admin API (`service_role` key), so they must go through an Edge Function.

### Changes

1. **Create Edge Function `supabase/functions/admin-manage-user/index.ts`**
   - Accepts actions: `delete_user`, `set_password`, `update_role`
   - Validates the caller is an admin (checks `user_roles` table using service role)
   - `delete_user`: calls `supabase.auth.admin.deleteUser(userId)`
   - `set_password`: calls `supabase.auth.admin.updateUserById(userId, { password })`
   - `update_role`: inserts/deletes from `user_roles` table
   - Uses `SUPABASE_SERVICE_ROLE_KEY` (already configured)

2. **Update `src/pages/AdminDashboard.tsx`** -- User Management section:
   - Add **Delete** button (with confirmation dialog) per user row
   - Add **Set Password** button that opens a dialog to enter a new password
   - Add **Role** selector (admin/user) in the edit dialog
   - Add email display in the user table for identification
   - Wire all actions to call the new edge function
   - Note: These actions affect the user's access to the booking/quote dashboard (`/dashboard`)

3. **Update `loadUsers`** to also fetch user email from profiles or display it if available

### Technical Details

- The Edge Function uses `SUPABASE_SERVICE_ROLE_KEY` to perform admin-level auth operations (delete user, update password). This key is already in secrets.
- Caller authentication: The edge function verifies the JWT from the Authorization header, then checks the `user_roles` table to confirm the caller has the `admin` role.
- Deleting a user cascades via `ON DELETE CASCADE` on `profiles.user_id` and `user_roles.user_id`, cleaning up related data automatically.
- Password requirements: minimum 6 characters (Supabase default).

