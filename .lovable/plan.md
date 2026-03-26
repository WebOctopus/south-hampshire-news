

## Move Artwork Upload to Dedicated Sidebar Tab & Auto-Redirect After Payment

### Overview
Remove the artwork upload from the BookingDetailsDialog and create a standalone "Artwork Upload" sidebar tab. After payment confirmation (Stripe/GoCardless), redirect users to this new tab instead of "Bookings".

### Changes

#### 1. Dashboard Sidebar (`src/components/dashboard/DashboardSidebar.tsx`)
- Add `Palette` icon import
- Add "Artwork Upload" item to the Advertising section (after Bookings, before Vouchers)
- Tab value: `"artwork"`

#### 2. New Component: `src/components/dashboard/ArtworkUploadTab.tsx`
- Standalone page listing all paid bookings for the current user that need artwork
- For each paid booking, show a card with: booking reference, ad size, dimensions, and the upload interface (reusing logic from existing `ArtworkUploadSection.tsx`)
- Show status badges (Pending/Approved/Rejected) for already-uploaded artwork
- If no paid bookings exist, show an empty state message

#### 3. Dashboard Page (`src/pages/Dashboard.tsx`)
- Add `"artwork"` to the valid tab list (line ~249)
- Add `{activeTab === 'artwork' && <ArtworkUploadTab />}` to the render section (~line 1490)
- Import the new component

#### 4. Payment Redirect (`src/pages/PaymentSetup.tsx`)
- Change both redirect calls from `navigate('/dashboard?tab=bookings')` to `navigate('/dashboard?tab=artwork')` so users land on the artwork upload tab after payment

#### 5. BookingDetailsDialog (`src/components/dashboard/BookingDetailsDialog.tsx`)
- Remove the `ArtworkUploadSection` component from the dialog
- Remove its import
- Optionally add a "Upload Artwork" link/button that navigates to the artwork tab

### What stays the same
- `ArtworkUploadSection.tsx` — reused inside the new tab component (per-booking upload logic)
- `booking_artwork` table, storage bucket, admin ArtworkManagement — all unchanged
- BookingCard and booking list display — unchanged

