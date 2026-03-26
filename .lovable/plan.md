

## Artwork Upload for Paid Bookings

### Overview
After payment is verified (Stripe/GoCardless), users can upload their artwork file from the booking details dialog. The upload shows the required dimensions based on their ad size. Admins get notified and can view/download artwork from a new admin section, labeled by user and booking.

### 1. Database

**New table: `booking_artwork`**

```sql
CREATE TABLE public.booking_artwork (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  notes text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz
);

ALTER TABLE public.booking_artwork ENABLE ROW LEVEL SECURITY;

-- Users can view/insert their own artwork
CREATE POLICY "Users can view own artwork" ON public.booking_artwork
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can upload artwork" ON public.booking_artwork
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admins full access
CREATE POLICY "Admin full access artwork" ON public.booking_artwork
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
```

**New storage bucket: `booking-artwork`** (public, with RLS on `storage.objects`).

### 2. User-Facing: Artwork Upload Section

**File: `src/components/dashboard/BookingDetailsDialog.tsx`**

After the "Payment confirmed!" alert (for paid bookings only), add an **Artwork Upload** card:

- Show the ad size name and dimensions from the booking's `adSize` query (already fetched)
- Display spec text: "Please supply artwork at **{dimensions}**, 300dpi, as PDF or JPG"
- Upload area using drag-and-drop (reuse `ImageDropzone` pattern or a simple file input)
- Optional notes textarea for the user
- Submit button that uploads to `booking-artwork` bucket and inserts a row into `booking_artwork` table
- If artwork already uploaded, show the file name, upload date, and status badge (Pending/Approved/Rejected)
- Allow re-upload if status is "rejected"

### 3. Admin Dashboard: Artwork Management

**New component: `src/components/admin/ArtworkManagement.tsx`**

- Table listing all `booking_artwork` rows joined with booking contact info
- Columns: User Name, Company, Ad Size, File, Upload Date, Status, Actions
- Download button for the file
- Approve/Reject buttons with optional admin notes
- Filter by status (pending/approved/rejected)

**File: `src/components/admin/AdminSidebar.tsx`** — Add "Artwork" menu item with `Palette` icon.

**File: `src/pages/AdminDashboard.tsx`** — Add `artwork` section rendering `ArtworkManagement`.

### 4. Types Update

**File: `src/integrations/supabase/types.ts`** — Add `booking_artwork` table types.

### What stays the same
- Existing booking flow, payment processing, and BookingCard are unchanged
- The artwork upload only appears after payment is confirmed (`isPaid` check)

