

## Fix: Company Name Not Saved to Profile During Quote/Booking User Creation

### Problem
When a user is created via quote (admin "on behalf" or self-service), the company name from the contact form is never written to the `profiles` table. Two gaps:

1. **`handle_new_user` DB trigger** only copies `display_name` from `raw_user_meta_data` — ignores `company`.
2. **Admin "on behalf" flow** doesn't pass `company` to `create_user` at all, and neither flow updates the profile with company after creation.

### Fix (3 changes)

#### 1. DB Migration: Update `handle_new_user` trigger function
Add company extraction from user metadata so it's automatically populated for new users (covers normal signup):

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, company, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;
```

#### 2. `src/components/AdvertisingStepForm.tsx` — Admin "on behalf" flow
After user creation via edge function, upsert the profile with company, phone, and display_name. Add this after getting `userId` (around line 296):

```ts
await supabase.from('profiles').upsert({
  user_id: userId,
  display_name: fullName,
  company: contactData.companyName || null,
  phone: contactData.phone || null,
}, { onConflict: 'user_id' });
```

This covers both new users (where the trigger may not have company) and existing users (where profile already exists but may lack company).

#### 3. `supabase/functions/admin-manage-user/index.ts` — Pass company in user_metadata
Update `create_user` action to include company in `user_metadata`:

```ts
user_metadata: {
  display_name: createDisplayName || undefined,
  company: body.company || undefined,
  phone: body.phone || undefined,
}
```

And update the caller in `AdvertisingStepForm.tsx` to pass `company` and `phone` in the edge function call body.

### Summary
- DB trigger updated to capture company/phone from metadata on signup
- Admin flow explicitly upserts profile with company after user creation
- Edge function forwards company to user metadata

