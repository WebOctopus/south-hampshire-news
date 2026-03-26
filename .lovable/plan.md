

## Add Campaign Schedule Calendar Tab to User Dashboard

### Overview
Create a new "My Schedule" sidebar tab that displays a calendar-style view of the user's booked advertising schedule. Only shows for paid bookings with artwork uploaded. Each booked month/date is highlighted on the calendar with details about which areas and ad sizes are scheduled.

### Changes

#### 1. New Component: `src/components/dashboard/CampaignScheduleTab.tsx`
- Fetch paid bookings (payment_status in `paid`, `subscription_active`, `mandate_active`) that also have artwork uploaded (join `booking_artwork` table)
- Extract schedule data from each booking's `selections.months` (area-to-months map), `distribution_start_date`, and `duration_multiplier`
- Render a month-by-month calendar grid using a custom layout (not DayPicker, since we're highlighting whole months, not individual days):
  - For **magazine bookings**: highlight the booked issue months (bimonthly, e.g. "June 2026", "August 2026") with area names and ad size
  - For **leafleting bookings**: show delivery dates from area schedules, formatted as specific weeks
- Each highlighted month/date is a colored card showing: booking type, areas, ad size, and status
- Empty state when no qualifying bookings exist

#### 2. Dashboard Sidebar (`src/components/dashboard/DashboardSidebar.tsx`)
- Add a new "My Schedule" item to the advertising group with `CalendarDays` icon and value `schedule`
- Position it after "Artwork Upload"

#### 3. Dashboard Page (`src/pages/Dashboard.tsx`)
- Import `CampaignScheduleTab`
- Add `{activeTab === 'schedule' && <CampaignScheduleTab />}` to the tab rendering block
- Add `'schedule'` to the valid tab params list

### Calendar display approach
Use a custom month-grid calendar (not react-day-picker) since bookings are month-based, not day-based. Layout:
- Navigation arrows to move between date ranges
- Grid of month cards for a 6-12 month window
- Booked months are highlighted with booking details (colored by booking type)
- Leafleting dates show specific delivery week markers within their month

### Technical detail
- Schedule data comes from `booking.selections.months` (object mapping area IDs to month strings like `2026-06`) or is derived from `distribution_start_date` + `duration_multiplier` as fallback
- Leaflet delivery dates come from `leaflet_areas.schedule` entries
- Query includes a check against `booking_artwork` to only show bookings where artwork has been uploaded

