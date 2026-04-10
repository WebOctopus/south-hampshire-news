

## Add Admin Notification Email for New Event Submissions

### Problem
When a community member submits an event for review, no notification is sent to admins. Admins must manually check the dashboard for pending submissions.

### Solution
Create a new Edge Function (`send-event-notification`) that sends an email to the admin via Resend when a new event is submitted. The email includes a direct link to the event detail page and key event details.

After inserting the event, call this Edge Function from the submission form with the event data.

### Changes

#### 1. New Edge Function: `supabase/functions/send-event-notification/index.ts`
- Uses Resend (matching existing pattern from `send-booking-confirmation-email`)
- Sends to admin email (`discover@discovermagazines.co.uk`)
- CC same address (matching existing CC pattern)
- Email contains:
  - Event title, date, time, location, area, category, organizer
  - Contact email/phone if provided
  - Direct link to the event: `https://south-hampshire-news.lovable.app/events/{event_id}`
  - Direct link to admin pending submissions tab
- From: `Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>`

#### 2. Update `src/pages/AddEvent.tsx`
- Change the insert to use `.select().single()` so we get the created event's `id` back
- After successful insert, call `supabase.functions.invoke('send-event-notification', { body: { ... } })` with the event details and the returned `id`
- Fire-and-forget (don't block the success UI on email delivery)

#### 3. Also update `src/pages/Dashboard.tsx`
- Same change for the event submission form in the user dashboard (line ~484)
- Call the same Edge Function after successful insert

### Technical Details
- Follows existing Resend pattern used across the project
- Uses `RESEND_API_KEY` already configured in Edge Function secrets
- Event URL format: `https://south-hampshire-news.lovable.app/events/{id}`
- Admin URL: `https://south-hampshire-news.lovable.app/admin` (Events Management tab)

