

## Plan: Add Directory Keywords Field to Business Listings

### Overview

Add a "Directory Keywords" text field to business listings that allows admins to add searchable keywords/tags to improve business discovery in the directory search.

---

### Current State

- The `businesses` table does **not** have a keywords column
- The admin `BusinessEditForm` has no keywords field
- The `get_public_businesses` RPC searches name, description, city, and postcode only

---

### Implementation Steps

**Step 1: Database Migration**

Add a new `keywords` text column to the `businesses` table:
- Column name: `keywords`
- Type: `text` (nullable)
- Purpose: Store comma-separated or space-separated searchable terms

**Step 2: Update Admin BusinessEditForm**

Add the Keywords field to `src/components/admin/BusinessEditForm.tsx`:
- Add `keywords` to the formData state
- Add a Textarea input in the "Basic Information" section
- Label: "Directory Keywords"
- Placeholder: "e.g., plumber, heating, boiler repair, emergency"
- Helper text explaining the purpose

**Step 3: Update Search RPC Function**

Modify `get_public_businesses` to include keywords in the search:
- Add `OR b.keywords ILIKE '%' || search_term || '%'` to the WHERE clause

**Step 4: Update User Edit Form (Optional)**

Add keywords to `UserBusinessEditForm.tsx` so business owners can also manage their keywords.

---

### Database Change

```sql
ALTER TABLE businesses 
ADD COLUMN keywords text;

COMMENT ON COLUMN businesses.keywords IS 'Searchable keywords/tags to improve directory discovery';
```

---

### Form Field Location

The keywords field will be added to the "Basic Information" section, after the description field:

```text
Basic Information
├── Business Name *
├── Category
├── Description (textarea)
├── Directory Keywords (textarea) ← NEW
├── Business Type
└── Sector
```

---

### Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add `keywords` column to `businesses` table |
| `src/components/admin/BusinessEditForm.tsx` | Add keywords field to form |
| `get_public_businesses` RPC | Include keywords in search filter |
| `src/components/dashboard/UserBusinessEditForm.tsx` | Add keywords field (optional) |

---

### Technical Details

**Form State Update:**
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  keywords: business?.keywords || '',
});
```

**Form Input:**
```tsx
<div className="space-y-2">
  <Label htmlFor="keywords">Directory Keywords</Label>
  <Textarea
    id="keywords"
    value={formData.keywords}
    onChange={(e) => handleChange('keywords', e.target.value)}
    placeholder="e.g., plumber, heating, boiler repair, emergency"
    rows={2}
  />
  <p className="text-xs text-muted-foreground">
    Add searchable keywords to help customers find this business
  </p>
</div>
```

**RPC Search Update:**
```sql
AND (search_term IS NULL OR 
     b.name ILIKE '%' || search_term || '%' OR
     b.description ILIKE '%' || search_term || '%' OR
     b.city ILIKE '%' || search_term || '%' OR
     b.postcode ILIKE '%' || search_term || '%' OR
     b.keywords ILIKE '%' || search_term || '%')  -- NEW
```

