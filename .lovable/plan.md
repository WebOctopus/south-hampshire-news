

## Enhance Dashboard Event Edit Form with All Fields + Image Upload

### Problem
The dashboard event form is missing many fields that exist in the AddEvent form and the database schema. Organisers who receive login credentials cannot fully manage their events -- they can't upload images, add contact details, ticket URLs, end dates/times, excerpts, or full descriptions.

### Changes

**File: `src/pages/Dashboard.tsx`**

1. **Expand `eventFormData` state** (line 95-106) to include all missing fields:
   - `date_end`, `end_time`, `excerpt`, `full_description`
   - `ticket_url`, `contact_email`, `contact_phone`
   - `image` (URL string from upload)

2. **Add image upload state and handlers** -- replicate the `imageFile`/`imagePreview`/`uploadImage` pattern from AddEvent.tsx (upload to `event-images` storage bucket)

3. **Update `handleEditEvent`** (line 566-581) to populate all new fields from the existing event data

4. **Update `handleEventSubmit`** (line 484-563) to:
   - Upload image file if provided before inserting/updating
   - Include all new fields in the insert/update payload
   - Clear image state on reset

5. **Update `renderCreateEventForm`** (line 981-1170) to add form fields for:
   - Image upload dropzone (drag & drop or click, with preview and clear)
   - End Date + End Time row
   - Excerpt (short summary)
   - Full Description (rich textarea)
   - Ticket URL
   - Contact Email + Contact Phone
   - Use the `editionAreas` dropdown for Area (matching AddEvent)
   - Use dynamic `event_categories` and `event_types` taxonomies for Category and Type dropdowns (matching AddEvent)

6. **Update all reset points** (lines 994-1005, 540-551) to clear the new fields

7. **Add imports**: `editionAreas`, `useEventCategories`, `useEventTypes`, `ImageDropzone` or a simple file input with preview

### Technical details
- Reuses the same `event-images` storage bucket and upload pattern from AddEvent
- Area dropdown uses `editionAreas` data (same as AddEvent)
- Category/Type use the taxonomy hooks `useEventCategories`/`useEventTypes` (same as AddEvent)
- When editing, existing image URL shown as preview; user can replace or clear it

