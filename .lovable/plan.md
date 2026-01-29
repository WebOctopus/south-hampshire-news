

## Plan: Featured Advertisers Admin Management

### Overview
Build a new admin section to manage Featured Advertisers displayed on the homepage carousel. Admins can add, edit, delete, and reorder advertisers, with the ability to link each advertiser to their business directory listing.

---

### Database Schema

**New Table: `featured_advertisers`**

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | Primary key |
| name | text | NOT NULL | Advertiser business name |
| image_url | text | NOT NULL | URL to the advertiser artwork image |
| business_id | uuid | NULL | Optional link to businesses table |
| sort_order | integer | 0 | Display order in carousel |
| is_active | boolean | true | Whether to show in carousel |
| created_at | timestamp | now() | Creation timestamp |
| updated_at | timestamp | now() | Last update timestamp |

**RLS Policies:**
- Public can view active advertisers (SELECT)
- Admins have full access (ALL)

**Storage Bucket:** Use existing `business-images` bucket for advertiser artwork uploads.

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useFeaturedAdvertisers.ts` | React Query hooks for CRUD operations |
| `src/components/admin/FeaturedAdvertisersManagement.tsx` | Admin management UI component |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/AdminSidebar.tsx` | Add "Featured Advertisers" menu item |
| `src/pages/AdminDashboard.tsx` | Add case for featured-advertisers section |
| `src/components/FeaturedAdvertisersSection.tsx` | Fetch from database instead of hardcoded data |

---

### Admin Management Features

1. **Table View**
   - Thumbnail preview
   - Advertiser name
   - Linked business (with link to directory listing)
   - Active toggle
   - Drag-and-drop reordering (like Magazine Editions)

2. **Add/Edit Dialog**
   - Advertiser Name (text input)
   - Artwork Image (drag-and-drop upload)
   - Link to Business (searchable dropdown of businesses from database)
   - Sort Order (number)
   - Active Toggle (switch)

3. **Business Linking**
   - Dropdown shows all businesses from the directory
   - Searchable/filterable by business name
   - Shows "No business linked" option
   - When linked, clicking advertiser on homepage navigates to `/business/{id}`

---

### Component: FeaturedAdvertisersManagement.tsx

```text
+----------------------------------------------------------+
|  Featured Advertisers                      [Add Advertiser] |
|  Manage the advertisers displayed on the homepage carousel |
+----------------------------------------------------------+
| Order | Image    | Name                  | Linked Business | Active | Actions |
|-------|----------|----------------------|-----------------|--------|---------|
|  ≡ 1  | [thumb]  | DJ Summers Plumbing  | (not linked)    |  ✓     | ✎ 🗑    |
|  ≡ 2  | [thumb]  | Edwards Conservatory | Edwards Ltd     |  ✓     | ✎ 🗑    |
|  ≡ 3  | [thumb]  | Acorn Tree Specialist| Acorn Tree Ltd  |  ✓     | ✎ 🗑    |
+----------------------------------------------------------+
```

---

### Hook: useFeaturedAdvertisers.ts

```typescript
interface FeaturedAdvertiser {
  id: string;
  name: string;
  image_url: string;
  business_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  businesses?: {
    id: string;
    name: string;
  } | null;
}
```

**Query Functions:**
- `useFeaturedAdvertisers(includeInactive)` - Fetch all advertisers with optional business join
- `useFeaturedAdvertiserMutations()` - Create, update, delete, toggle, reorder

---

### Frontend Component Updates

**FeaturedAdvertisersSection.tsx Changes:**
- Replace hardcoded `advertisers` array with database query
- Use `useFeaturedAdvertisers(false)` to fetch active advertisers
- Keep existing navigation logic (if businessId → Link, else → Dialog popup)
- Add loading skeleton while fetching
- Fallback to empty state if no advertisers configured

```tsx
const { data: advertisers, isLoading } = useFeaturedAdvertisers(false);

if (isLoading) return <Skeleton />;
if (!advertisers?.length) return null;

// Existing carousel code using fetched data
```

---

### Admin Sidebar Entry

Add to `menuItems` array in AdminSidebar.tsx:

```typescript
{
  title: "Featured Advertisers",
  icon: Star, // or Megaphone
  section: "featured-advertisers"
}
```

---

### Business Selection Dropdown

The admin form includes a searchable select for linking to businesses:

1. Query `get_public_businesses` RPC function to list all businesses
2. Show business name and location in dropdown
3. Allow clearing selection (unlink)
4. Display linked business name with link to directory page

---

### Data Migration

Initial data: Migrate the 8 current hardcoded advertisers into the new database table, with `business_id` set to NULL (to be linked later by admin).

---

### User Flow

1. **Admin enables Featured Advertiser management** → Goes to Admin Dashboard → Featured Advertisers
2. **Admin adds new advertiser** → Uploads artwork → Enters name → Optionally links to business → Saves
3. **Admin links existing advertiser to business** → Clicks Edit → Searches for business in dropdown → Saves
4. **User clicks advertiser on homepage** → If linked, navigates to business detail page; if not linked, shows enlarged image popup

---

### Security

- RLS policies ensure only admins can modify featured advertisers
- Public can only view active advertisers
- Image uploads validated for file type (JPG, PNG, WebP) and size (max 5MB)
- Business linking uses existing business IDs from the verified businesses table

