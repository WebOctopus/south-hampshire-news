
## Plan: Add Admin Inline Editing for Advertising Page

### Overview
Enable admin users to edit text and image content directly on the Advertising page without needing to modify code. The content will be stored in the existing `content_blocks` database table and displayed dynamically.

---

### Key Features

| Feature | Description |
|---------|-------------|
| **Admin Detection** | Check if current user has admin role using the existing `useAuth` hook |
| **Inline Edit Mode** | Toggle between "view" and "edit" mode for admin users |
| **Editable Content** | Text headings, paragraphs, stats, and image URLs |
| **Visual Indicators** | Subtle edit icons/borders when hovering editable content |
| **Auto-save** | Changes save to database with success toast notifications |
| **Fallback Content** | Hardcoded defaults if no database content exists |

---

### What Content Will Be Editable

**Hero Section:**
- Trust badge text ("South Hampshire's Leading...")
- Main headline ("Reach 142,000 Affluent Homes")
- Subheadline paragraph
- Background video URL

**Stats Bar:**
- Each stat number (142k, 14, 72%, etc.)
- Each stat label

**"Love Your Business" Section:**
- Main heading
- Subheading
- Story paragraphs
- Key stats row numbers/labels
- Quote text

**Media Pack & Maps Section:**
- Section headings
- Section descriptions
- Embed URLs (Adobe InDesign iframes)

**Quote/Calculator Section:**
- Badge text
- Heading
- Subheading
- Motivational tagline

**Enquiry Section:**
- Phone number
- Description text

---

### Technical Implementation

#### 1. Database Schema
Use the existing `content_blocks` table:

```text
┌──────────────────────────────────────────────────────┐
│ content_blocks table (already exists)                │
├──────────────────────────────────────────────────────┤
│ id          │ uuid                                   │
│ name        │ text (e.g., "advertising_hero")        │
│ block_type  │ text (e.g., "page_section")            │
│ content     │ jsonb (the editable content)           │
│ settings    │ jsonb (optional display settings)      │
│ position    │ text (e.g., "advertising")             │
│ is_active   │ boolean                                │
│ sort_order  │ integer                                │
└──────────────────────────────────────────────────────┘
```

**Content JSONB structure example:**
```json
{
  "hero": {
    "trustBadge": "South Hampshire's Leading Local Magazine Publisher",
    "headline": "Reach 142,000 Affluent Homes",
    "subheadline": "Generate brand awareness...",
    "videoUrl": "https://..."
  },
  "stats": [
    { "number": "142k", "label": "Bi-monthly Circulation" },
    { "number": "14", "label": "Local Editions" }
  ],
  "loveSection": {
    "heading": "Love Your Business...",
    "subheading": "Invest in Local Advertising...",
    "paragraphs": ["Discover Magazine is...", "We started publishing..."],
    "quote": "We've perfected the formula..."
  }
}
```

#### 2. New Components

| Component | Purpose |
|-----------|---------|
| `EditableText` | Wraps text elements, shows edit UI when admin + edit mode |
| `EditableImage` | Wraps images, shows upload/URL change UI |
| `EditModeToggle` | Floating button for admins to toggle edit mode |
| `InlineEditor` | Text input/textarea overlay for editing |
| `useAdvertisingContent` | Hook to fetch/save content from `content_blocks` |

#### 3. Component Structure

```text
Advertising.tsx
├── useAuth (check isAdmin)
├── useAdvertisingContent (fetch/save content)
├── EditModeToggle (floating button, admin only)
│
├── Hero Section
│   ├── EditableText (trust badge)
│   ├── EditableText (headline)
│   ├── EditableText (subheadline)
│   └── EditableImage (video URL input)
│
├── Stats Bar
│   └── EditableText × 5 (number + label pairs)
│
├── Love Your Business Section
│   ├── EditableText (heading, subheading)
│   ├── EditableText × 2 (paragraphs)
│   └── EditableText (quote)
│
└── ... other sections
```

#### 4. Edit Mode UX Flow

1. Admin loads page → sees normal content + floating "Edit Page" button
2. Clicks "Edit Page" → page enters edit mode
3. Editable elements show:
   - Subtle dashed border on hover
   - Small pencil icon overlay
4. Click element → inline editor appears (input/textarea)
5. Type changes → auto-save after 1s debounce
6. Toast confirms "Content saved"
7. Click "Exit Edit Mode" → returns to normal view

#### 5. Files to Create/Modify

**New Files:**
- `src/hooks/useAdvertisingContent.ts` — Fetch/save advertising page content
- `src/components/inline-editor/EditableText.tsx` — Inline text editor component
- `src/components/inline-editor/EditableImage.tsx` — Inline image/URL editor
- `src/components/inline-editor/EditModeToggle.tsx` — Floating toggle button
- `src/components/inline-editor/InlineEditor.tsx` — The actual edit overlay

**Modified Files:**
- `src/pages/Advertising.tsx` — Wrap content in EditableText/EditableImage components

---

### Admin Experience

```text
┌─────────────────────────────────────────────────────────────┐
│  [🔧 Edit Page]  ← Floating button (admin only, top-right) │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │
│  │  ✏️ South Hampshire's Leading Magazine Publisher  │ ← Hover shows edit │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │
│                                                             │
│        Reach 142,000 Affluent Homes                         │
│        ───────────────────────────────                      │
│        [Click to edit headline...]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**When editing:**
```text
┌─────────────────────────────────────────────────────────────┐
│  [✓ Exit Edit Mode]                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [input] Reach 142,000 Affluent Homes     [✓] [✗]    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│        "Saved!" (toast notification)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Security Considerations

- Only users with `admin` role (via `user_roles` table) can see edit button
- All save operations go through Supabase RLS policies (existing "Only admins can manage content blocks" policy)
- Content sanitized before display (no raw HTML injection)

---

### Implementation Steps

1. **Create the content hook** (`useAdvertisingContent.ts`)
   - Fetch content from `content_blocks` where `position = 'advertising'`
   - Mutation to update content
   - Merge fetched content with default fallbacks

2. **Build inline editor components**
   - `EditableText` — wraps text, shows input on click when in edit mode
   - `EditModeToggle` — floating button that toggles edit context
   - Share edit state via React Context

3. **Seed initial content**
   - Create one `content_blocks` row with the current hardcoded content
   - This provides the starting point for admin edits

4. **Update Advertising.tsx**
   - Import and wrap text/stats in `EditableText` components
   - Add `EditModeToggle` component
   - Replace hardcoded values with dynamic content from hook

5. **Test admin flow**
   - Verify non-admins see normal page
   - Verify admins can toggle edit mode
   - Verify changes persist after refresh

---

### Non-Goals (for this phase)

- Drag-and-drop section reordering
- Adding/removing entire sections
- Rich text editing (WYSIWYG)
- Image file uploads (just URL changes for now)
- Version history/rollback

These can be added in future iterations if needed.
