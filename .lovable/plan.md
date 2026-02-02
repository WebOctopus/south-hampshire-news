

## Plan: Support Multi-Day Events with Date Range

### Overview

Add support for events that span multiple days (e.g., a 3-day festival). Currently, events only have a single `date` field. This plan introduces a `date_end` column that is optional - when populated, the event displays as a date range on the frontend.

---

### Database Changes

Add a new column to the `events` table:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `date_end` | date | YES | NULL | End date for multi-day events |

**Logic:**
- If `date_end` is NULL or equals `date`, treat as a single-day event (show only start date)
- If `date_end` is different from `date`, display as a date range

---

### CSV Template Changes

**Current headers:**
```
title,date,time,end_time,location,area,...
```

**New headers:**
```
title,date,date_end,time,end_time,location,area,...
```

The CSV import will:
- Parse the new `date_end` column (optional)
- If `date_end` is empty, it remains NULL in the database
- If only `date` is provided, that becomes the start date

---

### Files to Modify

| File | Changes |
|------|---------|
| **Database** | Add `date_end` column to `events` table |
| `src/hooks/useEvents.ts` | Add `date_end` to Event and EventFormData interfaces |
| `src/components/admin/EventsManagement.tsx` | Update CSV template, CSV parser, and add date_end field to event form |
| `src/components/EventCard.tsx` | Update date display to show range when date_end exists |
| `src/pages/EventDetail.tsx` | Update date display to show range when date_end exists |
| `src/pages/AddEvent.tsx` | Add optional date_end field to the user submission form |

---

### Frontend Display Logic

**EventCard (grid view):**

```text
Single-day event:
┌─────────┐
│   FEB   │
│   15    │
│   Sat   │
└─────────┘

Multi-day event:
┌─────────┐
│ FEB 15  │
│    -    │
│ FEB 17  │
└─────────┘
```

**EventDetail page:**

Single-day: "Saturday, 15 February 2025"
Multi-day: "15 - 17 February 2025" or "15 February - 17 February 2025"

---

### Admin Form Changes

Add a new field in the "Basic Info" tab under the date picker:

```text
Date & Time Section:
┌──────────────────────────────────────────────────┐
│  Date *              │  End Date (for multi-day) │
│  [2025-02-15]        │  [2025-02-17]             │
├──────────────────────┼───────────────────────────┤
│  Start Time *        │  End Time                 │
│  [10:00]             │  [18:00]                  │
└──────────────────────┴───────────────────────────┘
```

---

### CSV Template Update

**New template example:**
```csv
title,date,date_end,time,end_time,location,area,postcode,category,type,excerpt,description,organizer,ticket_url,contact_email,contact_phone
"Summer Festival","2025-07-15","2025-07-17","10:00","18:00","Central Park","Downtown","AB12 3CD","Community","Festival","Join us for 3 days of fun!","Full description here...","Local Council","https://tickets.example.com","events@example.com","01234567890"
"One Day Concert","2025-08-20","","19:00","23:00","Music Hall","City Center","CD45 6EF","Music","Concert","An evening of live music","Full description...","Music Promotions","","info@concert.com",""
```

- `date_end` can be left empty for single-day events
- The CSV parser will handle empty values as NULL

---

### Technical Implementation

**CSV Parser Update (EventsManagement.tsx):**
```typescript
parsedEvents.push({
  // ...existing fields
  date: event.date,
  date_end: event.date_end || undefined,  // New field
  time: event.time,
  // ...rest of fields
});
```

**EventCard Date Display Logic:**
```typescript
const hasDateRange = event.date_end && event.date_end !== event.date;

if (hasDateRange) {
  // Show compact date range badge
  return (
    <div className="date-badge">
      <span>{formatShortDate(event.date)}</span>
      <span>-</span>
      <span>{formatShortDate(event.date_end)}</span>
    </div>
  );
}
// Show single date as before
```

**EventDetail Date Display Logic:**
```typescript
const hasDateRange = event.date_end && event.date_end !== event.date;

if (hasDateRange) {
  return `${formatDate(event.date)} - ${formatDate(event.date_end)}`;
}
return formatDate(event.date);
```

---

### User Submission Form (AddEvent.tsx)

Add an optional "End Date" field for users submitting multi-day events:

```text
Date & Time Section:
┌────────────────────────────────────────────────────────────────┐
│  Date *              │  End Date (optional)    │  Start Time * │
│  [date picker]       │  [date picker]          │  [10:00]      │
└──────────────────────┴─────────────────────────┴───────────────┘
```

With helper text: "Leave blank for single-day events"

---

### Summary of Changes

1. **Database**: Add `date_end` column (optional date field)
2. **Type definitions**: Update Event and EventFormData interfaces
3. **Admin CSV template**: Include `date_end` column
4. **Admin CSV import**: Parse `date_end` field
5. **Admin event form**: Add date_end input field
6. **User submission form**: Add optional date_end field
7. **EventCard**: Show date range when applicable
8. **EventDetail**: Show date range in header

