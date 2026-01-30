

## Plan: Add Verified and Featured Badges to Business Cards

### Overview

Add "Verified" and "Featured" badges to the Business Directory cards, matching the existing badge styling used on the Business Detail page.

---

### Current State

- **Data availability**: The `get_public_businesses` RPC already returns `is_verified` and `featured` fields
- **BusinessDirectory.tsx**: The `Business` interface already includes these fields
- **BusinessCard.tsx**: Missing these fields in its interface and not displaying badges
- **BusinessDetail.tsx**: Already shows these badges with proper styling (blue for Verified, yellow for Featured)

---

### Changes Required

**File: `src/components/BusinessCard.tsx`**

1. Add `is_verified` and `featured` optional boolean fields to the `BusinessCardProps` interface

2. Add the badges to the existing badge section (after category and biz_type badges):
   - Verified badge: Blue styling (`bg-blue-100 text-blue-800`)
   - Featured badge: Yellow styling (`bg-yellow-100 text-yellow-800`)

---

### Visual Result

The business cards will display badges in this order:
1. Category badge (green) - e.g., "Business & IT"
2. Biz Type badge (outline) - e.g., "BIZ Recruitment / HR"
3. Verified badge (blue) - if `is_verified` is true
4. Featured badge (yellow) - if `featured` is true

This matches the reference screenshot showing the badge row layout.

---

### Technical Details

**Interface update:**
```typescript
interface BusinessCardProps {
  business: {
    // ... existing fields
    is_verified?: boolean;
    featured?: boolean;
    // ...
  };
}
```

**Badge rendering (added to existing badge section):**
```tsx
{business.is_verified && (
  <Badge variant="default" className="bg-blue-100 text-blue-800">
    Verified
  </Badge>
)}
{business.featured && (
  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
    Featured
  </Badge>
)}
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/BusinessCard.tsx` | Add `is_verified` and `featured` to interface; render badges |

### No Database Changes Required

The `get_public_businesses` RPC function already returns both fields - no backend modifications needed.

