

## Fix: Status showing raw "Bogof_return_interest" in View Quote dialog

### Problem
Line 1532 in `src/pages/Dashboard.tsx` displays the raw database status with CSS `capitalize`, producing "Bogof_return_interest" instead of a user-friendly label.

### Fix
Replace line 1532's raw status output with a proper mapping function, matching the labels already used elsewhere:

| Raw Status | Display Label |
|---|---|
| `bogof_return_interest` | Awaiting Contact |
| `active` | Active |
| `approved` | Approved |
| `pending` | Pending |
| `draft` (or empty) | Draft |

**File**: `src/pages/Dashboard.tsx`, line 1532

Change:
```tsx
<p className="capitalize">{viewingQuote.status || 'Draft'}</p>
```
To:
```tsx
<p>{viewingQuote.status === 'bogof_return_interest' ? 'Awaiting Contact' :
    viewingQuote.status === 'active' ? 'Active' :
    viewingQuote.status === 'approved' ? 'Approved' :
    viewingQuote.status === 'pending' ? 'Pending' :
    'Draft'}</p>
```

