

## Backfill and Organise Media Library

### Current State
- 41 static images in `public/lovable-uploads/` (logos, magazine covers, hero background, ad previews, icons)
- 8 Supabase storage buckets with uploaded files (business-images, event-images, story-images, magazine-covers, ad-preview-images, competition-images, media-library, invoices)
- The `media_library` table has no folder/category column for organisation

### Changes

1. **Add `folder` column to `media_library` table** via migration — nullable text field for organising files into categories like "Logos", "Magazine Covers", "Hero Images", "Ad Previews", "Map Assets", etc.

2. **Add a "Backfill from Storage" button** to `MediaLibraryManagement.tsx`:
   - Scans all public Supabase storage buckets (`business-images`, `event-images`, `story-images`, `magazine-covers`, `ad-preview-images`, `competition-images`)
   - For each file found, checks if it already exists in `media_library` (by `file_path`)
   - Creates `media_library` records for new files, auto-assigning folders based on the source bucket (e.g., bucket `magazine-covers` → folder "Magazine Covers")
   - Shows a progress indicator and summary of what was imported

3. **Add folder filter UI** to `MediaLibraryManagement.tsx`:
   - Dropdown or chip filter above the file grid to filter by folder
   - Editable folder field in the edit metadata dialog
   - Display folder badge on each file card

4. **Register static lovable-uploads**: The backfill will also insert records for the known static images in `public/lovable-uploads/` with descriptive names and folders:
   - `discover-logo.png`, `discover-logo-2.png` → folder "Logos"
   - `2f7e4e32...png` → folder "Hero Images"
   - 8 magazine cover images → folder "Magazine Covers"
   - Remaining unused images → folder "Uncategorised"

   These will use the local path (`/lovable-uploads/...`) as `file_path` since they're static assets.

### Technical Details
- Storage bucket listing uses `supabase.storage.from(bucket).list()` which returns file metadata
- The backfill is idempotent — running it multiple times won't create duplicates (checked by `file_path`)
- The `folder` column is a free-text field, not an enum, so users can create custom folders

