

## Plan: Remove Category Filter Dropdown Entirely

### What Will Be Removed

The entire category dropdown filter will be removed from the Business Directory page, leaving only:
- Search box (on the left)
- Location filter (on the right)

### Technical Changes

**File: `src/pages/BusinessDirectory.tsx`**

| Section | Change |
|---------|--------|
| Lines 244-258 | Remove the entire `<Select>` component for category filtering |
| State variable | Keep `selectedCategory` but set it to always be `'all'` (or remove filtering logic) |

### Visual Result

**Before:**
```
[Search box] [Category dropdown] [Location dropdown]
```

**After:**
```
[Search box] [Location dropdown]
```

### Code to Remove

```tsx
{/* This entire block will be removed */}
<Select value={selectedCategory} onValueChange={(value) => {
  setSelectedCategory(value);
  setCurrentPage(1);
}}>
  <SelectTrigger className="w-full md:w-48 h-12 text-black">
    <SelectValue placeholder="Select Category" />
  </SelectTrigger>
  <SelectContent>
    {categories.map((category) => (
      <SelectItem key={category.id} value={category.id}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Additional Cleanup

The `selectedCategory` state and related filtering logic will be set to always use `'all'` so businesses are not filtered by category.

