

## Plan: Mandatory Location Selection & Anti-Scraping Protection

### Overview

Add two security/UX features to the Business Directory:
1. **Mandatory location selection** - Users must select a location before seeing business listings
2. **Text selection prevention** - Disable copying/highlighting text on the page

---

### Implementation Details

#### Part 1: Mandatory Location Selection

**Current behavior:** 
- Businesses load immediately on page load with "all" locations
- Location dropdown defaults to "Your Location" (which shows all)

**New behavior:**
- Show a prompt/empty state instead of loading businesses when no location is selected
- Users must choose a specific location to see any listings
- Once selected, businesses filter as normal

**Changes to `BusinessDirectory.tsx`:**
1. Modify `fetchBusinesses` to skip fetching if `selectedLocation === 'all'`
2. Show a friendly prompt in place of the business grid when no location selected
3. Update the placeholder text to make it clear selection is required

#### Part 2: Text Selection Prevention (Anti-Scraping)

**Approach:**
Add CSS classes to prevent text selection on the business directory page and business cards.

**CSS to add to `src/index.css`:**
```css
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

**Apply to:**
- The main container of the Business Directory page
- Business card components (optionally just the content area)

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/BusinessDirectory.tsx` | Add location requirement check, show prompt when no location selected, apply `no-select` class |
| `src/index.css` | Add `.no-select` utility class to prevent text selection |

---

### UI Flow After Changes

```text
User visits /business-directory
           ↓
┌─────────────────────────────────┐
│  Location dropdown: "Your      │
│  Location" (placeholder)       │
│                                │
│  ┌───────────────────────────┐ │
│  │   📍 Select Your Area     │ │
│  │                           │ │
│  │   Please choose a         │ │
│  │   location above to view  │ │
│  │   local businesses        │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
           ↓
      User selects location
           ↓
┌─────────────────────────────────┐
│  Business cards appear         │
│  (text cannot be selected)     │
└─────────────────────────────────┘
```

---

### Technical Details

**Location Check Logic:**
```typescript
// Don't fetch if no location selected
useEffect(() => {
  if (selectedLocation !== 'all') {
    fetchBusinesses();
  } else {
    setBusinesses([]);
    setTotalCount(0);
    setLoading(false);
  }
}, [selectedLocation, searchTerm, selectedCategory, currentPage]);
```

**Empty State Component:**
```tsx
{selectedLocation === 'all' ? (
  <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Select Your Area
    </h3>
    <p className="text-gray-600 max-w-md mx-auto">
      Please choose a location from the dropdown above to view local businesses in your area.
    </p>
  </div>
) : (
  // existing business grid
)}
```

**Anti-Copy CSS:**
```css
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

---

### Security Notes

- Text selection prevention is a deterrent, not a bulletproof solution
- Determined scrapers can still access data via browser dev tools or API calls
- For stronger protection, consider rate limiting on the API level (future enhancement)
- The mandatory location reduces bulk scraping by requiring interaction

