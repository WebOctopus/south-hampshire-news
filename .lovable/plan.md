

## Fix: Cannot Delete Users with GoCardless Mandates

### Problem
Deleting users fails with error: `update or delete on table "users" violates foreign key constraint "gocardless_mandates_user_id_fkey" on table "gocardless_mandates"`. Users who have GoCardless mandate records cannot be deleted because the FK doesn't cascade.

### Solution

**Database Migration**: Alter the `gocardless_mandates` table foreign key to cascade on delete.

```sql
ALTER TABLE public.gocardless_mandates
  DROP CONSTRAINT gocardless_mandates_user_id_fkey,
  ADD CONSTRAINT gocardless_mandates_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

This single migration ensures that when a user is deleted, their GoCardless mandate records are automatically cleaned up first, preventing the FK violation.

### No code changes needed
The edge function and UI are working correctly -- the issue is purely a database constraint.

