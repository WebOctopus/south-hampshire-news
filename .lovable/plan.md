

## Plan: Ensure Form Fields Clear When Adding New Events

### Problem

When an admin adds an event and then tries to add another one, the form fields may retain data from the previous event. This can cause confusion and data entry errors.

### Root Cause

The current "Add Event" button only opens the dialog without explicitly resetting the form. While there is a `resetForm()` function that runs when the dialog closes, this may not always execute reliably.

### Solution

Explicitly call `resetForm()` when the "Add Event" button is clicked, ensuring a clean form every time.

---

### Implementation

**File to modify:** `src/components/admin/EventsManagement.tsx`

**Change:** Add an `onClick` handler to the "Add Event" button that resets the form before opening the dialog.

**Current code (around line 448):**
```tsx
<DialogTrigger asChild>
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Add Event
  </Button>
</DialogTrigger>
```

**Updated code:**
```tsx
<DialogTrigger asChild>
  <Button onClick={() => resetForm()}>
    <Plus className="h-4 w-4 mr-2" />
    Add Event
  </Button>
</DialogTrigger>
```

This ensures that:
1. Clicking "Add Event" always starts with a completely blank form
2. Previous event data is cleared before the dialog opens
3. The `editingEvent` state is set to `null` (via `resetForm()`)

---

### Summary

| File | Change |
|------|--------|
| `src/components/admin/EventsManagement.tsx` | Add `onClick={() => resetForm()}` to the "Add Event" button |

This is a small, focused change that guarantees a fresh form each time an admin adds a new event.

