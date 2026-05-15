## Make Phone Number Required on Competition Entry Form

Update `src/components/CompetitionEntryForm.tsx`:

1. Change the zod schema for `phone` from `z.string().optional()` to a required, validated UK phone field:
   ```ts
   phone: z.string()
     .trim()
     .min(7, 'Please enter a valid phone number')
     .max(20, 'Phone number must be less than 20 characters')
     .regex(/^[0-9+\s()-]+$/, 'Phone number can only contain digits, spaces, +, -, ()'),
   ```
2. Update the form label from `Phone Number (Optional)` to `Phone Number *`.
3. Remove the `|| null` fallback in `onSubmit` so `phone` is sent as the validated string.

No DB / backend changes required — the `competition_entries.phone` column already accepts the value, and existing rows with null phones remain valid.
