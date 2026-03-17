

## Fix Missing `{{dimensions}}` and `{{areas_selected}}` in Booking Emails

### Problem
The `booking_fixed_customer` (and likely `quote_fixed_customer`) DB email templates use `{{dimensions}}` and `{{areas_selected}}` template variables, but the edge function's variable map in `send-booking-confirmation-email/index.ts` never sets these keys. They render as literal `{{dimensions}}` and `{{areas_selected}}` in sent emails.

### Root Cause
- **`{{dimensions}}`**: The ad size dimensions (e.g. "128mm x 180mm") exist in the `ad_sizes` DB table but the edge function only receives the ad size name (e.g. "1/2 Page Portrait"), not the dimensions string. The function needs to look up dimensions from the DB.
- **`{{areas_selected}}`**: The payload includes `selected_areas` as an array of area names, but the variable map uses `number_of_areas` (a count) instead of joining the names into `areas_selected`.

### Fix — `supabase/functions/send-booking-confirmation-email/index.ts`

**1. Look up ad size dimensions from DB** (around line 377, before building vars):
- When `payload.ad_size` is provided, query the `ad_sizes` table to get the `dimensions` field matching by name
- Pass it as the `dimensions` variable

**2. Add `areas_selected` to the variable map** (line ~398):
- Join `payload.selected_areas` array into a comma-separated string and map it to `areas_selected`

**3. Update the `available_variables` column** for `booking_fixed_customer` and `quote_fixed_customer` templates to include `dimensions` and `areas_selected`

### Changes
- `supabase/functions/send-booking-confirmation-email/index.ts` — Add DB lookup for dimensions, add `areas_selected` variable
- DB migration — Update `available_variables` arrays for the two fixed templates
- Redeploy edge function

