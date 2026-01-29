

## Plan: Link Featured Advertisers to Business Directory Listings

### Overview
Currently, clicking on a featured advertiser opens a dialog showing the enlarged image. The user wants clicking on an advertiser to navigate to that business's directory listing page instead.

---

### Challenge: Missing Database Entries

The featured advertisers in the carousel (DJ Summers Plumbing, Edwards Conservatory, Acorn Tree Specialist, etc.) **don't currently exist** in the businesses table. The existing businesses in the database are different entries.

---

### Options to Implement

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. Add business IDs to hardcoded data** | Store the business UUID alongside each advertiser | Direct linking, fast navigation | Requires creating businesses in DB first |
| **B. Search by name on click** | Query database for matching business name | Works without pre-linking | Slower, may not find exact match |
| **C. Create a featured_advertisers table** | Dedicated table linking to businesses | Clean separation, admin manageable | More complex setup |

---

### Recommended Approach: Option A

1. Add optional `businessId` property to each advertiser
2. If `businessId` exists, clicking navigates to `/business/${businessId}`
3. If no `businessId`, fall back to showing the enlarged image dialog (current behavior)

This allows gradual linking as businesses are added to the directory.

---

### Technical Changes

**File: `src/components/FeaturedAdvertisersSection.tsx`**

```tsx
// Before
const advertisers = [
  { name: 'DJ Summers Plumbing & Heating', logo: '/lovable-uploads/...' },
  ...
];

// After
const advertisers = [
  { 
    name: 'DJ Summers Plumbing & Heating', 
    logo: '/lovable-uploads/...', 
    businessId: null  // Will be updated with actual ID when business exists in DB
  },
  ...
];
```

**Navigation Logic:**
- Replace `Dialog` wrapper with conditional logic
- If `businessId` exists → navigate to `/business/${businessId}`
- If no `businessId` → show current dialog popup (fallback)

```tsx
{advertiser.businessId ? (
  <Link to={`/business/${advertiser.businessId}`}>
    <div className="flex items-center justify-center p-4 bg-background rounded-lg...">
      <img src={advertiser.logo} alt={advertiser.name} />
    </div>
  </Link>
) : (
  <Dialog>
    <DialogTrigger asChild>
      <div className="...">
        <img src={advertiser.logo} alt={advertiser.name} />
      </div>
    </DialogTrigger>
    <DialogContent>...</DialogContent>
  </Dialog>
)}
```

---

### Future Enhancement Option

To fully implement this feature, the 8 featured advertisers would need to be added to the `businesses` table with their details. This could be done by:

1. Admin manually creating each business in the admin dashboard
2. Importing via CSV
3. Or linking to existing businesses if they're added later

Once businesses exist in the database, update the `businessId` values in the component to match.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/FeaturedAdvertisersSection.tsx` | Add `businessId` field, conditional navigation vs dialog |

---

### Immediate Benefit

- Clicking navigates to business page when linked
- Falls back gracefully to image popup when not linked
- Ready for future business entries without code changes

