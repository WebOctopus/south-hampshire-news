

## Add "Create User" to User Management

### What We'll Build
Add a "Create User" button and dialog in the User Roles & Agency Management section, allowing admins to create new user accounts directly from the admin panel.

### Changes

1. **Update `supabase/functions/admin-manage-user/index.ts`**
   - Add a `create_user` action that uses `adminClient.auth.admin.createUser()` to create a new user with email, password, and optional display name
   - Set `email_confirm: true` so the user can log in immediately
   - The `handle_new_user` trigger will auto-create the profile

2. **Update `src/pages/AdminDashboard.tsx`**
   - Add state for the Create User dialog (`isCreateUserOpen`, `createUserForm` with email/password/displayName fields)
   - Add a "Create User" button above the user table (next to the heading area)
   - Add a dialog with email, password, and display name fields
   - Add optional "Send credentials via email" checkbox (reuses existing Resend integration)
   - On submit, invoke the edge function with `action: 'create_user'`, then refresh the user list

### Technical Details
- Uses Supabase Admin API `createUser()` which bypasses email confirmation
- The existing `handle_new_user` database trigger auto-creates the profile row
- Display name is passed via `user_metadata` so the trigger picks it up
- No database migrations needed

