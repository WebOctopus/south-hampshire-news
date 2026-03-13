

## Add CC to Booking/Quote Emails

### Change

In `supabase/functions/send-booking-confirmation-email/index.ts`, add `cc: ["discover@discovermagazines.co.uk"]` to both the admin notification email send (line 343) and the customer confirmation email send (line 429).

**Line ~343 (admin email):**
```typescript
const adminResult = await resend.emails.send({
  from: "Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>",
  to: adminEmail.split(",").map((e: string) => e.trim()),
  cc: ["discover@discovermagazines.co.uk"],
  subject: adminSubject,
  html: adminHtml,
});
```

**Line ~429 (customer email):**
```typescript
const customerResult = await resend.emails.send({
  from: "Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>",
  to: [payload.email],
  cc: ["discover@discovermagazines.co.uk"],
  subject: customerSubject,
  html: customerHtml,
});
```

After editing, the edge function will be redeployed so the change takes effect immediately.

