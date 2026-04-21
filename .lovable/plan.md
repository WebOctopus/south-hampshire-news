

## Unify Public + Dashboard Event Forms

Today the "Submit an Event" form (`/add-event`) and the dashboard "Create Event" form (`/dashboard?tab=create-event`) are two completely separate JSX blocks with different fields, ordering, validation, and styling. They drift every time we touch either one.

I'll extract **one shared form component** that both pages render, so any future field addition or copy change appears in both places automatically.

### Field reconciliation (single source of truth)

The dashboard version is missing several fields the public form has. We'll standardise on the **public form's** field set as the canonical version (it's the more complete, polished one):

| Field | Public form | Dashboard form | After |
|---|---|---|---|
| title * | yes | yes | yes |
| organizer * | yes (required) | yes (optional) | **required everywhere** |
| category / type * | yes | yes | yes |
| date / date_end | yes (with min) | yes | yes (with min) |
| time / end_time * | yes | yes | yes |
| location / area / postcode * | yes | yes | yes |
| excerpt (200-char counter) | yes | yes (no counter) | **counter everywhere** |
| full_description | yes | yes | yes |
| description (legacy 3-row field) | no | yes | **removed** (excerpt covers this) |
| image upload (drag-drop) | yes | yes (plain button) | **drag-drop everywhere** |
| contact_email / contact_phone | yes | yes | yes |
| website_url | yes | **missing** | **added to dashboard** |
| ticket_url | yes | yes | yes |
| Info banner ("Review Process") | yes | no | shown to public only |

### Architecture

**New file**: `src/components/events/EventFormFields.tsx`

A presentational component that renders the entire form body (all the sectioned fieldsets — Basic Info / Date & Time / Location / Description / Image / Contact & Links). It receives:

```ts
interface EventFormFieldsProps {
  formData: EventFormData;
  onChange: (field: string, value: string) => void;
  imagePreview: string | null;
  existingImageUrl?: string | null;   // for edit mode in dashboard
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
  showInfoBanner?: boolean;           // true on public page only
  isOnBehalf?: boolean;               // for admin contact-email required hint
}
```

It owns **only the fields and layout** — no submission logic, no captcha, no auth handling. That stays in the parent page.

**`src/pages/AddEvent.tsx`** keeps:
- Honeypot + Turnstile + edge function submission
- Admin "on behalf of" toggle and organiser-account creation
- Success screen
- Wraps `<EventFormFields showInfoBanner />`

**`src/pages/Dashboard.tsx`** keeps:
- `editingEvent` state + edit/create branching
- Direct Supabase insert/update (RLS-allowed for authed users)
- Cancel-edit button
- Wraps `<EventFormFields />` (no banner, no captcha)

### Other changes
- Drop the legacy `description` column usage from the dashboard form. We continue writing `description = excerpt` on insert so existing public listings that read `description` keep working (matches the public form's behaviour today).
- Update the dashboard's `defaultEventFormData` and `eventFormData` shape to match the canonical field set (adds `website_url`, removes standalone `description` from the form state).
- Update `handleEditEvent` in Dashboard so it maps the loaded event onto the new shape (including `website_url`).
- Validation rules in both submit handlers updated to match: title, organizer, date, time, location, area, category, type all required.
- Image upload in the dashboard switches to the same dropzone styling as the public form.

### Files changed

- **New**: `src/components/events/EventFormFields.tsx` — shared form body
- **Edit**: `src/pages/AddEvent.tsx` — replace inline JSX with `<EventFormFields showInfoBanner />`
- **Edit**: `src/pages/Dashboard.tsx` — replace `renderCreateEventForm()` JSX with `<EventFormFields />`, add `website_url` to state, remove standalone `description` field, align validation, swap image picker

### Result

- One form, two entry points. Add a field once, it shows up in both.
- Dashboard users get the polished sectioned layout, drag-drop image upload, character counter, and the missing `website_url` field.
- Public form behaviour (Turnstile, honeypot, edge function, success screen) is unchanged.
- Admin moderation queue, slug generation, and email notifications are untouched.

