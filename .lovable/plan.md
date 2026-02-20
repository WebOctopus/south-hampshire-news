
## Add Branded Footer to All Emails

### What's Changing

Every transactional email currently has a minimal footer with only "Peacock & Pixel Ltd | Discover Magazine" and a tagline. This will be replaced with a fully branded footer that includes:

- The Discover Magazine logo (hosted image)
- Phone: 023 8026 6388 (with a phone icon)
- Email: discover@discovermagazines.co.uk (with an email icon)
- Address: 30 Leigh Road, Eastleigh, SO50 9DT Hampshire (with a location icon)
- Tagline: Connecting South Hampshire communities since 2014

Icons will be rendered as inline Unicode/emoji-style characters styled to match the green brand colour, since HTML email clients do not support icon libraries like Lucide.

### Files Affected

**1. `supabase/functions/send-booking-confirmation-email/index.ts`**

Three footer locations:
- `buildAdminEmailHtml()` — line ~149–152 (admin notification footer)
- `buildCustomerEmailHtml()` — line ~223–231 (customer confirmation footer)
- The contact info block inside the customer email body (line ~217–221) will also be updated to use the correct phone number (currently shows `023 9298 9314`, needs updating to `023 8026 6388`) and correct email (`discover@discovermagazines.co.uk`)

**2. `supabase/functions/send-welcome-email/index.ts`**

One footer location in `buildFallbackHtml()` — line ~92–100.

**3. `supabase/functions/send-password-reset/index.ts`**

One footer location inside the inline HTML string — the footer `<tr>` block.

### What the New Footer Will Look Like

```text
┌─────────────────────────────────────────────┐
│          [Discover Magazine Logo]           │
│                                             │
│  📞 023 8026 6388                          │
│  ✉  discover@discovermagazines.co.uk       │
│  📍 30 Leigh Road, Eastleigh,              │
│     SO50 9DT Hampshire                     │
│                                             │
│  Connecting South Hampshire communities    │
│  since 2014                                │
│                                             │
│  Website  •  Contact Us  •  Advertise      │
└─────────────────────────────────────────────┘
```

### Logo

The Discover logo will be referenced as a hosted image from the live site:
`https://peacockpixelmedia.co.uk/lovable-uploads/discover-logo.png`

Since email clients block images by default, the alt text `Discover Magazine` will be shown as a fallback. The logo will be constrained to a maximum width of 160px.

### Icon Approach

Rather than relying on icon fonts (which email clients do not support), each contact item will use an inline SVG data URI or a simple Unicode character styled in the brand green:

- 📞 `&#x1F4DE;` — phone
- ✉ `&#x2709;` — email envelope
- 📍 `&#x1F4CD;` — location pin

These render natively in all major email clients (Gmail, Outlook, Apple Mail) without any dependencies.

### Technical Details

- A shared `buildBrandedFooterHtml()` helper function will be defined once at the top of each edge function file and reused in all email builders within that file — avoiding repetition.
- All three functions will be redeployed automatically after the changes.
- No database or RLS changes required.
- The contact info "Need help?" box inside `buildCustomerEmailHtml` will also be updated to show the correct phone number and email to ensure consistency.
