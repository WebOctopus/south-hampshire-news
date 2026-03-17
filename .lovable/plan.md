

## Fix `{{dimensions}}` in BOGOF Quote/Booking Templates

### What happened
The previous fix added `dimensions` to the variable mapping code in the Edge Function, but:
1. The Edge Function may not have been fully redeployed before the BOGOF quote was sent
2. The `available_variables` metadata for `quote_bogof_customer` and `booking_bogof_customer` templates doesn't include `dimensions`, which means the admin template editor won't show it as an available variable

### What's needed
The code fix is already in place (the `dimensions` DB lookup and variable mapping works for all template types). Two small changes:

**1. Database migration** — Add `dimensions` and `areas_selected` to the `available_variables` array for `quote_bogof_customer` and `booking_bogof_customer` templates (same as was done for the fixed templates)

**2. Redeploy Edge Function** — Already done. The function is now deployed with the dimensions lookup code.

After this, any new BOGOF quote/booking emails will correctly resolve `{{dimensions}}` to the actual ad size dimensions from the database.

