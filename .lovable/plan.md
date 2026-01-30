

## Plan: Fix "Woolston" Spelling Mistake in Location Dropdown

### The Issue

The location dropdown shows "SO19 Woolston &B surrounds" - there's an extra "B" after the "&" that shouldn't be there.

### Root Cause

This typo exists in the database. The `edition_area` column in the `businesses` table stores the value as:
- **Current (incorrect):** `Area 12 - SO19 Woolston &B surrounds`
- **Correct:** `Area 12 - SO19 Woolston & surrounds`

### Fix

Run a simple database update to correct all affected records:

```sql
UPDATE businesses 
SET edition_area = 'Area 12 - SO19 Woolston & surrounds'
WHERE edition_area = 'Area 12 - SO19 Woolston &B surrounds';
```

### Impact

- All businesses currently assigned to this area will be updated
- The location dropdown will immediately show the corrected spelling
- No code changes required - this is purely a data correction

### Files to Modify

| File | Changes |
|------|---------|
| Database (migration) | Update `edition_area` values to fix the typo |

