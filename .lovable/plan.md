

## Fix Download Button in Admin Artwork Management

### Problem
The download button uses an `<a download>` tag, but the `download` attribute is ignored by browsers for cross-origin URLs (Supabase storage). The file opens in a new tab instead of downloading.

### Fix

**File: `src/components/admin/ArtworkManagement.tsx`**

1. Add a `handleDownload` function that fetches the file URL as a blob, creates an object URL, and triggers a programmatic download via a temporary `<a>` element.

2. Replace the `asChild` `<a>` download button with a regular `<Button>` that calls `handleDownload(artwork.file_url, artwork.file_name)`.

```tsx
const handleDownload = async (fileUrl: string, fileName: string) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch {
    // Fallback: open in new tab
    window.open(fileUrl, '_blank');
  }
};
```

Single file change, no database or schema changes needed.

