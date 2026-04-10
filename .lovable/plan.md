

## Add Admin-Editable Event Categories & Types

### Problem
Event categories and types are hardcoded arrays in `src/hooks/useEvents.ts`. Admins cannot add, edit, or remove them.

### Solution
Store categories and types in two new database tables. Add a management section within the Events Management admin page. Update all consumers to fetch from the database instead of using hardcoded arrays.

### Changes

#### 1. Database Migration
Create two tables:
- **`event_categories`**: `id`, `name`, `sort_order`, `is_active`, `created_at`
- **`event_types`**: `id`, `name`, `sort_order`, `is_active`, `created_at`

Seed both with the current hardcoded values. Add RLS policies for public read, admin write.

#### 2. New Hook: `src/hooks/useEventTaxonomies.ts`
- `useEventCategories()` — fetches active categories ordered by `sort_order`
- `useEventTypes()` — fetches active types ordered by `sort_order`
- CRUD functions for admin use (create, update, delete, reorder)

#### 3. Events Management (`src/components/admin/EventsManagement.tsx`)
- Add a third tab: "Categories & Types" alongside "All Events" and "Pending Submissions"
- Two side-by-side lists (Categories and Types) with:
  - Add new item (text input + button)
  - Edit name inline
  - Delete (with confirmation)
  - Toggle active/inactive
  - Drag or arrow-button reordering

#### 4. Update Consumers
- **`src/hooks/useEvents.ts`**: Remove hardcoded `EVENT_CATEGORIES` and `EVENT_TYPES` arrays. Keep them as empty arrays for backward compatibility, but mark deprecated.
- **`src/components/admin/EventsManagement.tsx`**: Use `useEventCategories()` and `useEventTypes()` for the category/type dropdowns in the event form.
- **`src/pages/AddEvent.tsx`** (front-end form): Use the same hooks so the public submission form shows admin-configured options.

### Technical Details
- Tables use `sort_order` integer for ordering and `is_active` boolean to hide without deleting
- RLS: `SELECT` for everyone (public form needs it), `INSERT/UPDATE/DELETE` restricted via `has_role(auth.uid(), 'admin')`
- Seed migration inserts current hardcoded values so nothing changes on deploy

