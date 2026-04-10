

## Admin "On Behalf of Organiser" Event Creation

### Problem
Admins cannot create events on behalf of organisers. When an organiser calls in or emails event details, the admin has no way to submit the event and automatically provision the organiser with a dashboard login to verify details and upload an image.

### Solution
Add an "on behalf of organiser" toggle to the AddEvent form (visible only to admins), reusing the existing `admin-manage-user` edge function pattern. Create a new edge function to email the organiser their login credentials. The organiser can then log into the dashboard to review their event and upload an image.

### Changes

#### 1. Update `src/pages/AddEvent.tsx`
- Import `useAuth` to detect admin users, plus `Switch`, `Checkbox` components
- Add state: `isOnBehalf` (boolean toggle), `organiserEmail` (required when on-behalf)
- Show an amber-styled toggle box (matching the existing booking "on behalf" pattern) when user is admin
- When on-behalf is enabled, make `contact_email` required (used as the organiser's login email)
- On submit (when on-behalf):
  1. Call `admin-manage-user` edge function to create/find the organiser account (generates password)
  2. Insert the event with the organiser's `user_id` so they own it in the dashboard
  3. Call a new `send-event-organiser-login` edge function to email the organiser their credentials and a link to the event in the dashboard
  4. Still send the admin notification as normal

#### 2. New Edge Function: `supabase/functions/send-event-organiser-login/index.ts`
- Uses Resend (same pattern as other email functions)
- Sends to the organiser's email
- Email contains:
  - Welcome message explaining their event has been submitted
  - Login credentials (email + password) for new users, or a "log in" prompt for existing users
  - Direct link to dashboard: `https://south-hampshire-news.lovable.app/dashboard`
  - Link to their specific event
  - Instructions to upload an event image and verify details
- From: `Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>`

#### 3. Update Dashboard event display
- The organiser's events (linked via `user_id`) already appear in the dashboard under "My Events" (existing functionality)
- Ensure the dashboard event cards allow image upload for unpublished events owned by the user

### Technical Details
- Reuses `admin-manage-user` edge function for account creation (no session switching)
- Password auto-generated via `crypto.randomUUID().slice(0, 12)`
- Profile upserted with organiser name and phone
- Event inserted with `user_id` = organiser's user ID so they can manage it
- The `contact_email` field doubles as the organiser's login email when on-behalf is active
- Fire-and-forget email sending (non-blocking)

